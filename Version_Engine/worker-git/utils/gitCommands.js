export const commit = async (sessionId, message) => {
  // Logic to execute git commit command
  // Retrieve .git folder using sessionId
  // Execute: git commit -m "message"
  // Save changes to the database
};
export const rollback = async (sessionId, commitId) => {
  // Logic to execute git rollback command
  // Retrieve .git folder using sessionId
  // Execute: git reset --hard commitId
  // Save changes to the database
};
export const branch = async (sessionId, branchName) => {
  // Logic to execute git branch command
  // Retrieve .git folder using sessionId
  // Execute: git branch branchName
  // Save changes to the database
};
export const merge = async (sessionId, branchName) => {
  // Logic to execute git merge command
  // Retrieve .git folder using sessionId
  // Execute: git merge branchName
  // Save changes to the database
};
