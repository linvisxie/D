import {Platform} from 'react-native';
import {Buffer} from 'buffer';
import * as RNFS from '@dr.pogodin/react-native-fs';
import {
  pick,
  types,
  isErrorWithCode,
  errorCodes,
} from '@react-native-documents/picker';
import {readPngCharacterCard} from './pngCharacterCard';

export async function pickCharacterCard(): Promise<unknown | null> {
  try {
    const [file] = await pick({
      type:
        Platform.OS === 'ios'
          ? [types.json, 'public.png']
          : [types.json, 'image/png'],
    });
    const size = file.size ?? Number((await RNFS.stat(file.uri)).size);
    if (!Number.isFinite(size) || size < 0 || size > 24 * 1024 * 1024)
      throw new Error('请选择 24 MB 以内的角色卡');
    if (
      file.name?.toLowerCase().endsWith('.png') ||
      file.type?.includes('png')
    ) {
      return readPngCharacterCard(
        Buffer.from(await RNFS.readFile(file.uri, 'base64'), 'base64'),
      );
    }
    return JSON.parse(await RNFS.readFile(file.uri, 'utf8'));
  } catch (error) {
    if (isErrorWithCode(error) && error.code === errorCodes.OPERATION_CANCELED)
      return null;
    throw error;
  }
}
