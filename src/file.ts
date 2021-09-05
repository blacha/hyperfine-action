import { promises as fs } from 'fs';

export async function fileExists(fileName: string): Promise<boolean> {
  try {
    await fs.stat(fileName);
    return true;
  } catch (e) {
    return false;
  }
}
