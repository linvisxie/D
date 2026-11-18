export interface MemoryNote {
  text: string;
  keywords: string;
  enabled: boolean;
}

export function normalizeNotes(value: unknown): MemoryNote[] {
  if (!Array.isArray(value)) return [];
  return value.filter(
    (note): note is MemoryNote =>
      note &&
      typeof note.text === 'string' &&
      typeof note.keywords === 'string' &&
      typeof note.enabled === 'boolean',
  );
}

// Most recently added notes take precedence when the local context is limited.
export function recallNotes(
  notes: MemoryNote[] | undefined,
  message: string,
): string {
  const query = message.toLowerCase();
  const selected: string[] = [];
  let remaining = 1200;
  for (const note of normalizeNotes(notes).reverse()) {
    const keys = note.keywords
      .toLowerCase()
      .split(/[,，、]/)
      .map(key => key.trim())
      .filter(Boolean);
    const text = note.text.trim();
    if (
      !note.enabled ||
      !text ||
      text.length + 1 > remaining ||
      (keys.length && !keys.some(key => query.includes(key)))
    )
      continue;
    selected.push(text);
    remaining -= text.length + 1;
  }
  return selected.length
    ? '用户保存的角色记忆：\n' + selected.reverse().join('\n')
    : '';
}
