import {Buffer} from 'buffer';
import {readPngCharacterCard} from '../pngCharacterCard';
const signature = Buffer.from('89504e470d0a1a0a', 'hex');
function textChunk(name: string, card: object) {
  const payload = Buffer.from(
    name + '\0' + Buffer.from(JSON.stringify(card)).toString('base64'),
  );
  const size = Buffer.alloc(4);
  size.writeUInt32BE(payload.length, 0);
  return Buffer.concat([size, Buffer.from('tEXt'), payload, Buffer.alloc(4)]);
}
it('reads UTF-8 character data and prefers ccv3 when both versions are present', () => {
  const data = {data: {name: '莉娅'}};
  expect(
    readPngCharacterCard(
      Buffer.concat([
        signature,
        textChunk('chara', {}),
        textChunk('ccv3', data),
      ]),
    ),
  ).toEqual(data);
  expect(
    readPngCharacterCard(Buffer.concat([signature, textChunk('chara', data)])),
  ).toEqual(data);
});
it('rejects a regular image and a truncated chunk', () => {
  expect(() => readPngCharacterCard(signature)).toThrow();
  expect(() =>
    readPngCharacterCard(
      Buffer.concat([signature, textChunk('chara', {})]).subarray(0, -1),
    ),
  ).toThrow();
});
