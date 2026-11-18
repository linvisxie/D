import {readBook, readCard, readPreset, worldContext} from '../rpImport';

const entries = {
  station: {key: ['Dock'], content: '雾港的渡船'},
  weather: {constant: true, content: '下雨'},
  secret: {constant: true, disable: true, content: '隐藏'},
};

it('imports card text, first message and embedded lore as editable data', () => {
  const card = readCard({
    data: {
      name: '莉娅',
      description: '{{char}}是领航员',
      first_mes: '欢迎，{{user}}。',
      character_book: {entries},
    },
  });
  expect(card.systemPrompt).toContain('莉娅是领航员');
  expect(card.greetingText).toBe('欢迎，你。');
  expect(card.book).toEqual(readBook({entries}));
});

it('activates enabled constant and case-insensitive matching entries', () => {
  const book = JSON.stringify({entries});
  expect(worldContext(book, 'at the DOCK')).toBe('雾港的渡船\n下雨');
  expect(worldContext(book, 'hello')).toBe('下雨');
});

it('validates text presets, character names and lore before import', () => {
  expect(readPreset({system_prompt: '简短回答'})).toBe('简短回答');
  expect(() => readPreset({temperature: 1})).toThrow();
  expect(() => readCard({})).toThrow();
  expect(() => readBook({entries: [{}]})).toThrow();
});
