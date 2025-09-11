import fs from "fs/promises";
import fsSync from "fs";
import path from "path";
import os from "os";
import { exec } from "child_process";
import { promisify } from "util";

const execPromise = promisify(exec);

/**
 * Creates a temporary directory
 * @param {string} prefix - Prefix for the temp directory name
 * @returns {Promise<string>} - Path to the created temporary directory
 */
export async function createTempDir(prefix) {
  const tempDir = path.join(os.tmpdir(), `${prefix}-${Date.now()}`);
  await fs.mkdir(tempDir, { recursive: true });
  return tempDir;
}

/**
 * Cleans up a temporary directory
 * @param {string} dirPath - Path to the directory to clean up
 */
export async function cleanupTempDir(dirPath) {
  await fs.rm(dirPath, { recursive: true, force: true });
}

/**
 * Normalizes a file path by converting backslashes to forward slashes
 * @param {string} filePath - The file path to normalize
 * @returns {string} - Normalized path
 */
export function normalizeFilePath(filePath) {
  return filePath.replace(/\\/g, "/");
}

/**
 * Zips a directory
 * @param {string} sourcePath - Source directory path
 * @param {string} zipPath - Destination zip file path
 */
export async function zipDirectory(sourcePath, zipPath) {
  const gitDir = path.join(sourcePath, ".git");
  console.log(`Zipping directory from: ${sourcePath} to ${zipPath}`);
  if (process.platform === "win32") {
    await execPromise(
      `powershell -command "Compress-Archive -Path '${gitDir}\\*' -DestinationPath '${zipPath}' -Force"`
    );
  } else {
    // Change to .git directory and zip its contents
    await execPromise(`cd "${gitDir}" && zip -r "${zipPath}" .`);
  }
  console.log(`Successfully zipped .git directory to ${zipPath}`);
}

/**
 * Unzips a file
 * @param {string} zipPath - Path to the zip file
 * @param {string} destPath - Destination directory
 */
export async function unzipFile(zipPath, destPath) {
  console.log(`Extracting zip from: ${zipPath} to ${destPath}`);
  if (process.platform === "win32") {
    await execPromise(
      `powershell -command "Expand-Archive -Path '${zipPath}' -DestinationPath '${destPath}' -Force"`
    );
  } else {
    await execPromise(`unzip -o "${zipPath}" -d "${destPath}/.git"`);
    // await execPromise(
    //   `mkdir -p "${destPath}/.git" && unzip -o "${zipPath}" -d "${destPath}/.git"`
    // );
  }
}

/**
 * Collects files from a directory recursively
 * @param {string} dirPath - Directory to scan
 * @param {string[]} ignorePatterns - Patterns to ignore
 * @param {string} relativePath - Relative path for recursion
 * @returns {Promise<Array>} - Array of file info objects
 */
export async function collectFiles(
  dirPath,
  ignorePatterns = [],
  relativePath = ""
) {
  const entries = await fs.readdir(dirPath, { withFileTypes: true });
  let results = [];

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    const relativeFsPath = path.join(relativePath, entry.name);
    const normalizedPath = normalizeFilePath(relativeFsPath);

    if (ignorePatterns.some((pattern) => entry.name.includes(pattern))) {
      continue;
    }

    if (entry.isDirectory()) {
      const subResults = await collectFiles(
        fullPath,
        ignorePatterns,
        relativeFsPath
      );
      results = results.concat(subResults);
    } else if (entry.isFile()) {
      results.push({
        fullPath,
        relativeFsPath,
        normalizedPath,
      });
    }
  }

  return results;
}
