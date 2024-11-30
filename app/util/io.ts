import { promises as fs } from 'fs';

export async function readFile(day: number, filename: string): Promise<string> {
  return await fs.readFile(`${process.cwd()}/app/day/${day}/${filename}`, 'utf-8');
}