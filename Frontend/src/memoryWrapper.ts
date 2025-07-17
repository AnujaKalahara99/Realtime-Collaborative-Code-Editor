import { Volume } from 'memfs';

const vol = Volume.fromJSON({}, '/');
vol.mkdirSync('/src', { recursive: true });
vol.writeFileSync('/README.md', '# My Project\n\nWelcome to the project!');
vol.writeFileSync('/src/index.js', 'console.log("Hello World!");');

const fs = vol.promises;

export const getMemoryVolume = () => vol;

export async function readFile(filename: string) {
  return await fs.readFile(`/${filename}`, 'utf8');
}

export async function writeFile(filename: string, content: string): Promise<void> {
    await fs.writeFile(`/${filename}`, content);
    // await addFileToGit(filename); // Track with Git 
}

export async function createFolder(path: string, options: { recursive?: boolean } = { recursive: true }): Promise<void> {
    await fs.mkdir(`/${path}`, options);
}

export async function createFile(path: string, content: string = ''): Promise<void> {
  await fs.writeFile(`/${path}`, content);
}

export async function readDir(path: string): Promise<string[]> {
  const result = await fs.readdir(`/${path}`);
  return result as string[];
}

export function isFileSync(path: string): boolean {
  return vol.existsSync(path) && vol.statSync(path).isFile();
}
