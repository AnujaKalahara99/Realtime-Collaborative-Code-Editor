import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs/promises";
import {
  getGitFolderFromStorage,
  saveGitFolderToStorage,
  loadSessionFiles,
  saveSessionFiles,
} from "../utils/database.js";
import os from "os";

const execPromise = promisify(exec);

/**
 * Handles a rollback operation to a specific commit
 *
 * @param {string} sessionId - The session ID
 * @param {string} commitHash - The commit hash to rollback to
 * @returns {Promise<Object>} - Returns rollback result
 */
const handleRollback = async (sessionId, commitHash) => {
  const gitRepoPath = os.homedir() + `/repo`;

  try {
    await fs.mkdir(gitRepoPath, { recursive: true });
    await loadSessionFiles(sessionId, gitRepoPath);
    await getGitFolderFromStorage(sessionId, gitRepoPath);

    await execPromise(`git reset --hard ${commitHash}`, { cwd: gitRepoPath }); 

    // await saveGitFolderToStorage(sessionId, gitRepoPath);1

    await saveSessionFiles(sessionId, gitRepoPath);

    await fs.rm(gitRepoPath, { recursive: true, force: true });

    return {
      success: true,
      message: `Rolled back to commit ${commitHash}`,
      commitHash: commitHash,
    };
  } catch (error) {
    await fs.rm(gitRepoPath, { recursive: true, force: true });

    return {
      success: false,
      message: `Rollback failed: ${error.message}`,
      error: error.message,
    };
  }
};

export default handleRollback;
