import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs/promises";
import {
  getGitFolderFromStorage,
  checkGitFolderExists,
  saveGitFolderToStorage,
  saveCommitToDatabase,
  getBranchById,
  loadSessionFiles,
} from "../utils/database.js";
import os from "os";

const execPromise = promisify(exec);

/**
 * Handles a commit operation for a session
 *
 * @param {string} sessionId - The session ID
 * @param {string} message - The commit message
 * @param {string} branchId - The branch ID
 * @returns {Promise<Object>} - Returns commit result
 */
const handleCommit = async (sessionId, message, branchId) => {
  console.log(`Handling commit for session: ${sessionId}`);
  const gitRepoPath = os.homedir() + `/repo`;

  try {
    await fs.mkdir(gitRepoPath, { recursive: true });
    await loadSessionFiles(sessionId, gitRepoPath);

    const gitInitialized = await checkGitFolderExists(sessionId);
    console.log(`Git initialized for session ${sessionId}: ${gitInitialized}`);

    if (!gitInitialized) {
      console.log(
        `Git not initialized for session ${sessionId}, initializing now...`
      );

      await execPromise("git init", { cwd: gitRepoPath });
      await execPromise("git branch -m master main", { cwd: gitRepoPath });
      await execPromise(
        'git config --local user.email "system@codespace.com"',
        { cwd: gitRepoPath }
      );
      await execPromise('git config --local user.name "Codespace System"', {
        cwd: gitRepoPath,
      });
    } else {
      await getGitFolderFromStorage(sessionId, gitRepoPath);
    }

    if (branchId) {
      const branchName = await getBranchById(branchId);
      // Check if branch exists
      try {
        await execPromise(`git rev-parse --verify ${branchName}`, {
          cwd: gitRepoPath,
        });
        await execPromise(`git checkout ${branchName}`, { cwd: gitRepoPath });
      } catch {
        await execPromise(`git checkout -b ${branchName}`, {
          cwd: gitRepoPath,
        });
      }
    }
    await execPromise("git add .", { cwd: gitRepoPath });

    const commitMessage = message || "Automated commit";
    const { stdout } = await execPromise(`git commit -m "${commitMessage}"`, {
      cwd: gitRepoPath,
    });

    const commitHashMatch = stdout.match(/\[([^\]]+)\s([a-f0-9]{7,40})\]/);
    if (!commitHashMatch) {
      throw new Error("Could not extract commit hash from git output");
    }
    const commitHash = commitHashMatch[2];

    await saveGitFolderToStorage(sessionId, gitRepoPath);

    const commitRecord = await saveCommitToDatabase(
      branchId,
      null,
      commitHash,
      commitMessage
    );

    fs.rm(gitRepoPath, { recursive: true, force: true });

    return {
      success: true,
      message: "Commit successful",
      commitId: commitRecord.id,
      commitHash: commitHash,
    };
  } catch (error) {
    await fs.rm(gitRepoPath, { recursive: true, force: true });

    if (error.message && error.message.includes("nothing to commit")) {
      console.log("No changes to commit");
      return {
        success: false,
        message: "No changes to commit",
        error: "no_changes",
      };
    }

    console.error("Error in handleCommit:", error);
    return {
      success: false,
      message: `Commit failed: ${error.message}`,
      error: error.message,
    };
  }
};

export default handleCommit;
