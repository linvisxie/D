// Mobile JSON import supports text cards, prompt presets and basic lore entries.
function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error('需要 JSON 对象');
  }
  return value as Record<string, unknown>;
}

const string = (value: unknown) =>
  typeof value === 'string' ? value.trim() : '';

export function readCard(value: unknown) {
  const root = record(value);
  const card = record(root.data ?? root);
  const name = string(card.name);
  if (!name) throw new Error('角色卡缺少 name');
  const expand = (text: string) =>
    text.replace(/{{char}}/gi, () => name).replace(/{{user}}/gi, '你');
  const extension =
    card.extensions && typeof card.extensions === 'object'
      ? (card.extensions as Record<string, unknown>).d
      : undefined;
  const own =
    extension && typeof extension === 'object'
      ? (extension as Record<string, unknown>)
      : {};
  const prompt = [
    `你扮演${name}。`,
    card.system_prompt,
    card.description,
    card.personality,
    card.scenario,
    card.mes_example,
  ]
    .map(string)
    .filter(Boolean)
    .join('\n\n');
  return {
    name,
    description: string(card.description),
    systemPrompt: string(own.prompt) || expand(prompt),
    preset: string(own.preset),
    greetingText: expand(string(card.first_mes)),
    book: card.character_book ? readBook(card.character_book) : undefined,
  };
}

export function readPreset(value: unknown): string {
  const preset = record(value);
  const content = string(preset.system_prompt) || string(preset.prompt);
  if (content) return content;
  if (!Array.isArray(preset.prompts))
    throw new Error('预设需要包含 prompt、system_prompt 或 prompts 列表');
  const prompts = preset.prompts.map(record);
  const layouts = Array.isArray(preset.prompt_order)
    ? preset.prompt_order.map(record)
    : [];
  const layout =
    layouts.find(item => item.character_id === 100001) ??
    layouts[layouts.length - 1];
  const ordered =
    layout && Array.isArray(layout.order)
      ? layout.order
          .map(record)
          .filter(item => item.enabled !== false)
          .map(item =>
            prompts.find(prompt => prompt.identifier === item.identifier),
          )
      : prompts;
  const result = ordered
    .filter(
      prompt =>
        prompt &&
        !prompt.marker &&
        prompt.enabled !== false &&
        (!prompt.role || prompt.role === 'system'),
    )
    .map(prompt => string(prompt?.content))
    .filter(Boolean)
    .join('\n\n');
  if (!result) throw new Error('这份预设没有启用的系统提示词');
  return result;
}

export function readBook(value: unknown) {
  const raw = record(value).entries;
  const entries = Array.isArray(raw) ? raw : Object.values(record(raw));
  return entries.map(item => {
    const entry = record(item);
    const keys = entry.keys ?? entry.key ?? [];
    if (
      !Array.isArray(keys) ||
      keys.some(key => typeof key !== 'string') ||
      !string(entry.content)
    ) {
      throw new Error('世界书条目需要 content 文本和关键词数组');
    }
    return {
      keys: keys.map(string).filter(Boolean),
      content: string(entry.content),
      constant: entry.constant === true,
      enabled: entry.enabled !== false && entry.disable !== true,
    };
  });
}

export function worldContext(book: string, message: string): string {
  if (typeof book !== 'string' || !book) return '';
  let entries: ReturnType<typeof readBook>;
  try {
    entries = readBook(JSON.parse(book));
  } catch {
    // Previously imported PocketPal backups may contain invalid custom fields.
    return '';
  }
  const query = message.toLowerCase();
  return entries
    .filter(
      entry =>
        entry.enabled &&
        (entry.constant ||
          entry.keys.some(key => query.includes(key.toLowerCase()))),
    )
    .map(entry => entry.content)
    .join('\n');
}
