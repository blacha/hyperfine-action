import { stat } from 'node:fs/promises';

export async function fileExists(fileName: string): Promise<boolean> {
  try {
    await stat(fileName);
    return true;
  } catch (e) {
    return false;
  }
}
