import { useTheme } from "../../../Contexts/ThemeProvider";
import type { Commit } from "./GitTypes";
import { GitCommit, GitBranch } from "lucide-react";

interface CommitTreeProps {
  commits: Commit[];
  currentBranch: string;
}

const CommitTree = ({ commits, currentBranch }: CommitTreeProps) => {
  const { theme } = useTheme();

  if (commits.length === 0) {
    return (
      <div className={`text-xs ${theme.textMuted} p-4 text-center`}>
        No commits to display
      </div>
    );
  }

  // Sort commits by date (newest first)
  const sortedCommits = [...commits].sort(
    (a, b) => b.date.getTime() - a.date.getTime()
  );

  return (
    <div className="mt-4">
      <h3 className={`text-sm font-medium mb-2 ${theme.text}`}>Commit Tree</h3>
      <div className="relative pl-5">
        {/* Vertical line connecting commits */}
        <div className="absolute left-2 top-2 bottom-2 w-px bg-gray-300" />

        {/* Commits */}
        <div className="space-y-3">
          {sortedCommits.map((commit) => (
            <div key={commit.id} className="relative">
              {/* Commit node */}
              <div
                className={`absolute left-[-10px] top-1/2 transform -translate-y-1/2 w-4 h-4 rounded-full border-2 ${
                  commit.isCurrent
                    ? "bg-blue-500 border-blue-500"
                    : `${theme.surface} border-gray-400`
                }`}
              />

              {/* Commit info */}
              <div
                className={`pl-4 py-2 ${
                  commit.isCurrent
                    ? `${theme.active} border-l-2 border-blue-500`
                    : ""
                }`}
              >
                <div
                  className={`text-xs font-medium ${theme.text} flex items-center`}
                >
                  <GitCommit className="w-3 h-3 mr-1 flex-shrink-0" />
                  {commit.message}
                </div>
                <div className={`text-xs ${theme.textMuted}`}>
                  {new Date(commit.date).toLocaleDateString(undefined, {
                    day: "2-digit",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                  {" • "}
                  {commit.author}
                </div>
                {commit.isCurrent && (
                  <div
                    className={`text-xs text-blue-500 font-medium mt-1 flex items-center`}
                  >
                    <GitBranch className="w-3 h-3 mr-1 flex-shrink-0" />
                    HEAD • {currentBranch}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CommitTree;
