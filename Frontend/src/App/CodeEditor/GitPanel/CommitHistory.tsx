import { useTheme } from "../../../Contexts/ThemeProvider";
import type { Commit } from "./GitTypes";
import { RotateCcw, GitCommit, Clock } from "lucide-react";

interface CommitHistoryProps {
  commits: Commit[];
  onRollback: (commitId: string) => void;
}

const CommitHistory = ({ commits, onRollback }: CommitHistoryProps) => {
  const { theme } = useTheme();

  if (commits.length === 0) {
    return (
      <div className={`text-xs ${theme.textMuted} p-4 text-center`}>
        No commit history available
      </div>
    );
  }

  return (
    <div className="flex-grow overflow-auto">
      <h3 className={`text-sm font-medium mb-2 ${theme.text}`}>
        Commit History
      </h3>
      <ul className={`space-y-2`}>
        {commits.map((commit) => (
          <CommitItem key={commit.id} commit={commit} onRollback={onRollback} />
        ))}
      </ul>
    </div>
  );
};

interface CommitItemProps {
  commit: Commit;
  onRollback: (commitId: string) => void;
}

const CommitItem = ({ commit, onRollback }: CommitItemProps) => {
  const { theme } = useTheme();

  // Format date to a more readable format
  const formattedDate = new Date(commit.date).toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <li
      className={`relative p-2 rounded-md ${
        commit.isCurrent
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
        <span>{commit.author}</span>
        <span className="flex items-center">
          <Clock className="w-3 h-3 mr-1" />
          {formattedDate}
        </span>
      </div>

      {/* Rollback button - only show for past commits */}
      {!commit.isCurrent && (
        <button
          onClick={() => onRollback(commit.id)}
          className={`absolute top-2 right-2 p-1 rounded-full ${theme.hover} text-gray-500 hover:text-blue-500`}
          title="Rollback to this commit"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      )}
    </li>
  );
};

export default CommitHistory;
