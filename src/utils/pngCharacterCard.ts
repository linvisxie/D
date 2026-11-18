import {Buffer} from 'buffer';

// Character Card v2 and v3 store base64-encoded UTF-8 JSON in PNG tEXt.
export function readPngCharacterCard(bytes: Buffer): unknown {
  if (bytes.subarray(0, 8).toString('hex') !== '89504e470d0a1a0a') {
    throw new Error('文件不是 PNG 图片');
  }
  let fallback: unknown;
  let offset = 8;
  while (offset + 12 <= bytes.length) {
    const length = bytes.readUInt32BE(offset);
    const start = offset + 8;
    const end = start + length;
    if (end + 4 > bytes.length) throw new Error('PNG 数据不完整');
    const type = bytes.toString('ascii', offset + 4, start);
    if (type === 'IEND') break;
    if (type === 'tEXt') {
      const chunk = bytes.subarray(start, end);
      const separator = chunk.indexOf(0);
      if (separator === 4 || separator === 5) {
        const keyword = chunk.toString('ascii', 0, separator);
        if (keyword === 'ccv3' || keyword === 'chara') {
          const json = Buffer.from(
            chunk.toString('ascii', separator + 1),
            'base64',
          ).toString('utf8');
          const card = JSON.parse(json);
          if (keyword === 'ccv3') return card;
          fallback = card;
        }
      }
    }
    offset = end + 4;
  }
  if (!fallback)
    throw new Error('图片没有嵌入角色卡，请选择带角色设定的 PNG 或 JSON');
  return fallback;
}
