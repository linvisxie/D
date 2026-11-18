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
    systemPrompt: expand(prompt),
    greetingText: expand(string(card.first_mes)),
    book: card.character_book ? readBook(card.character_book) : undefined,
  };
}

export function readPreset(value: unknown): string {
  const preset = record(value);
  const content = string(preset.system_prompt) || string(preset.prompt);
  if (!content) throw new Error('预设需要包含 prompt 或 system_prompt 文本');
  return content;
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
  if (!book) return '';
  const query = message.toLowerCase();
  return readBook(JSON.parse(book))
    .filter(
      entry =>
        entry.enabled &&
        (entry.constant ||
          entry.keys.some(key => query.includes(key.toLowerCase()))),
    )
    .map(entry => entry.content)
    .join('\n');
}
