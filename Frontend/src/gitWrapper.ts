import * as git from 'isomorphic-git';
import { getMemoryVolume, writeFile } from './memoryWrapper';

const vol = getMemoryVolume();

export async function initRepo() {  
  await git.init({ fs : vol, dir: '/' });
  await commitAll('Initial commit');
  await getLog();
  console.log(vol.toJSON());
}

export interface GitAuthor {
    name: string;
    email: string;
}

export async function commitChanges(
    message: string,
    author: GitAuthor = { name: 'User', email: 'user@example.com' }
): Promise<string> {
    const sha: string = await git.commit({
        fs: vol,
        dir: '/',
        author,
        message
    });
    return sha;
}

export async function commitAll(
    message: string = 'Commit all',
    author: GitAuthor = { name: 'User', email: 'user@example.com' }
): Promise<string> {
  await git.add({ fs: vol, dir: '/', filepath: '.' });
  return await commitChanges(message, author);
}

export interface WriteAndCommitParams {
    filename: string;
    content: string | Uint8Array;
    message?: string;
    author?: GitAuthor;
}

export async function writeAndCommit(
    filename: string,
    content: string,
    message: string = 'Commit',
    author: GitAuthor = { name: 'User', email: 'user@example.com' }
): Promise<string> {
    const fullPath: string = `/${filename}`;
    await writeFile(fullPath, content);
    await git.add({ fs: vol, dir: '/', filepath: filename });
    const sha: string = await git.commit({
        fs: vol,
        dir: '/',
        author,
        message
    });
    return sha;
}

export async function getLog(): Promise<Array<git.ReadCommitResult>> {
  const log = await git.log({ fs: vol, dir: '/' })
  console.log('Fetching git log...', log);  
  return log;
}