import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs/promises";
import {
  getGitFolderFromStorage,
  saveGitFolderToStorage,
  createBranch,
  createSession,
  getSessionById,
  getBranchById,
} from "../utils/database.js";
import os from "os";

const execPromise = promisify(exec);

/**
 * Handles creating a new branch and session
 *
 * @param {Object} data - Job data containing sessionId and branchName
 * @returns {Promise<Object>} - Returns branch creation result
 */
const handleBranch = async (data) => {
  const { sessionId, branchName } = data;
  const gitRepoPath = os.homedir() + `/repo`;

  try {
    // Get current session to find workspace_id
    const currentSession = await getSessionById(sessionId);
    if (!currentSession) {
      throw new Error("Session not found");
    }

    await fs.mkdir(gitRepoPath, { recursive: true });
    await getGitFolderFromStorage(sessionId, gitRepoPath);

    // Create and checkout new branch in git
    await execPromise(`git checkout -b ${branchName}`, { cwd: gitRepoPath });

    await saveGitFolderToStorage(sessionId, gitRepoPath);

    // Create branch record in database
    const branchRecord = await createBranch(
      branchName,
      currentSession.workspace_id
    );

    // Create new session for the new branch
    const newSession = await createSession(branchRecord.id);

    await fs.rm(gitRepoPath, { recursive: true, force: true });

    return {
      success: true,
      message: `Branch '${branchName}' and new session created successfully`,
      branchId: branchRecord.id,
      branchName: branchName,
      newSessionId: newSession.id,
    };
  } catch (error) {
    await fs.rm(gitRepoPath, { recursive: true, force: true });

    console.error("Error in handleBranch:", error);
    return {
      success: false,
      message: `Branch creation failed: ${error.message}`,
      error: error.message,
    };
  }
};

export default handleBranch;
