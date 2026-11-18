import {recallNotes} from '../characterMemory';
const note = (text: string, keywords = '', enabled = true) => ({
  text,
  keywords,
  enabled,
});
it('recalls enabled notes for this turn in the user-defined language', () => {
  const notes = [
    note('总是记得'),
    note('在雾港相遇', '码头，DOCK'),
    note('跳过', '', false),
  ];
  expect(recallNotes(notes, 'dock')).toContain('在雾港相遇');
  expect(recallNotes(notes, '天气')).toBe('用户保存的角色记忆：\n总是记得');
  expect(recallNotes([], 'dock')).toBe('');
});
it('respects the context budget and preserves the stored order', () => {
  const notes = [note('甲'.repeat(800)), note('乙'.repeat(800))];
  expect(recallNotes(notes, '')).not.toContain('甲');
  expect(notes[0].text[0]).toBe('甲');
});
