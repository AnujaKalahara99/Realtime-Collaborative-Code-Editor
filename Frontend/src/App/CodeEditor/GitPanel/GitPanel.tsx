import { useState, useEffect } from "react";
import { useTheme } from "../../../Contexts/ThemeProvider";
import BranchSelector from "./BranchSelector";
import CommitHistory from "./CommitHistory";
// import CommitTree from "./CommitTree";
import CommitForm from "./CommitForm";

const GitPanel = () => {
  const { theme } = useTheme();

  // Loading states
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize Git state on component mount
  useEffect(() => {
    const initGitState = async () => {
      try {
        setIsLoading(true);
        setError(null);
      } catch (err) {
        setError("Failed to initialize Git panel");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    initGitState();
  }, []);

  // Handle branch selection
  // const handleBranchSelect = async (branchName: string) => {
  //   try {
  //     setIsLoading(true);
  //     setError(null);

  //     // Switch branch and get updated state
  //     const updatedState = await switchBranch(branchName);
  //     setGitState(updatedState);
  //   } catch (err) {
  //     setError(`Failed to switch to branch: ${branchName}`);
  //     console.error(err);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  return (
    <div className={`h-full flex flex-col ${theme.surface} ${theme.text}`}>
      <div className={`p-4 ${theme.border} border-b`}>
        <BranchSelector
        // branches={gitState.branches}
        // onBranchSelect={handleBranchSelect}
        />
      </div>

      <div className="flex-grow overflow-auto p-4 Simple-Scrollbar">
        {isLoading && (
          <div
            className={`flex items-center justify-center h-full ${theme.textMuted}`}
          >
            <svg
              className="animate-spin -ml-1 mr-3 h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Loading Git data...
          </div>
        )}

        {error && (
          <div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4"
            role="alert"
          >
            <p>{error}</p>
          </div>
        )}

        {!isLoading && (
          <>
            <CommitHistory
            // commits={gitState.commits}
            // onRollback={handleRollback}
            />
          </>
        )}
      </div>

      <div className="p-4">
        <CommitForm />
      </div>
    </div>
  );
};

export default GitPanel;
