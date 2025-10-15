import { useTheme } from "../../../Contexts/ThemeProvider";
import { RotateCcw, GitCommit, Clock, Loader2 } from "lucide-react";
import type { Commit } from "../../Dashboard/codespace.types";
import { formatDateTime } from "../../../utility/utility";
import { useEditorCollaboration } from "../../../Contexts/EditorContext";

const CommitHistory = () => {
  const { theme } = useTheme();
  const {
    codespace,
    activeSessionIndex,
    rollbackToCommit,
    gitOperationLoading,
  } = useEditorCollaboration();
  const commits = codespace?.sessions?.[activeSessionIndex]?.commits || [];

  if (commits.length === 0) {
    return (
      <div className={`text-xs ${theme.textMuted} p-4 text-center`}>
        No commit history available
      </div>
    );
  }

  const handleRollback = async (commitHash: string) => {
    if (gitOperationLoading) return; // Prevent multiple operations

    const success = await rollbackToCommit(commitHash);
    if (success) {
      console.log("Successfully rolled back to commit:", commitHash);
      // You might want to refresh the UI or show a success message
    }
  };

  return (
    <div className="flex-grow overflow-auto">
      <h3 className={`text-sm font-medium mb-2 ${theme.text}`}>
        Commit History
      </h3>
      {gitOperationLoading && (
        <div
          className={`flex items-center justify-center p-2 text-xs ${theme.textMuted}`}
        >
          <Loader2 className="w-3 h-3 mr-2 animate-spin" />
          Operation in progress...
        </div>
      )}
      <ul className={`space-y-2`}>
        {commits.map((commit) => (
          <CommitItem
            key={commit.id}
            commit={commit}
            onRollback={handleRollback}
            isLoading={gitOperationLoading}
          />
        ))}
      </ul>
    </div>
  );
};

interface CommitItemProps {
  commit: Commit;
  onRollback: (commitHash: string) => void;
  isLoading: boolean;
}

const CommitItem = ({ commit, onRollback, isLoading }: CommitItemProps) => {
  const { theme } = useTheme();

  return (
    <li
      className={`relative p-2 rounded-md ${
        commit.id === "current"
          ? `${theme.active} border-l-4 border-blue-500`
          : `${theme.surface} ${theme.hover}`
      }`}
    >
      {/* Commit Message */}
      <div
        className={`text-sm font-medium ${theme.text} mb-1 flex items-center`}
      >
        <GitCommit className="w-4 h-4 mr-2 flex-shrink-0" />
        <span>{commit.message}</span>
      </div>

      {/* Commit Details */}
      <div
        className={`text-xs ${theme.textMuted} flex justify-between items-center`}
      >
        <span>commit</span>
        <span className="flex items-center">
          <Clock className="w-3 h-3 mr-1" />
          {formatDateTime(commit.createdAt)}
        </span>
      </div>

      {
        <button
          onClick={() => onRollback(commit.commitHash)}
          disabled={isLoading}
          className={`absolute top-2 right-2 p-1 rounded-full ${theme.hover} ${
            isLoading
              ? "opacity-50 cursor-not-allowed"
              : "text-gray-500 hover:text-blue-500"
          }`}
          title={
            isLoading ? "Operation in progress" : "Rollback to this commit"
          }
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <RotateCcw className="w-4 h-4" />
          )}
        </button>
      }
    </li>
  );
};

export default CommitHistory;
