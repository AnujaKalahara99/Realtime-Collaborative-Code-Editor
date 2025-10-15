import React, { useState, useEffect } from "react";
import { useTheme } from "../../../Contexts/ThemeProvider";
import { useEditorCollaboration } from "../../../Contexts/EditorContext";

interface GitHubIntegrationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const GitHubIntegrationModal: React.FC<GitHubIntegrationModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { theme } = useTheme();
  const { codespace, updateGitHubDetails } = useEditorCollaboration();

  const [githubRepo, setGithubRepo] = useState("");
  const [githubToken, setGithubToken] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form with existing values when opened
  useEffect(() => {
    if (isOpen && codespace?.gitHubRepo) {
      setGithubRepo(codespace.gitHubRepo);
    }
  }, [isOpen, codespace]);

  const handleGitHubIntegration = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const success = await updateGitHubDetails(githubRepo, githubToken);
      if (success) {
        onClose();
        // Clear the token after successful integration for security
        setGithubToken("");
      }
    } catch (err) {
      console.error("Failed to update GitHub details:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      ></div>

      {/* Modal Container */}
      <div className="flex items-center justify-center min-h-screen p-4">
        <div
          className={`relative w-full max-w-md p-6 ${theme.surface} ${theme.border} border rounded-md shadow-lg`}
          style={{ maxWidth: "500px" }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal Header */}
          <div className="mb-4 flex justify-between items-center">
            <h2 className={`text-lg font-medium ${theme.text}`}>
              GitHub Repository Integration
            </h2>
            <button
              onClick={onClose}
              className={`${theme.textMuted} hover:${theme.text}`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          <p className={`mb-4 text-sm ${theme.textMuted}`}>
            Only the owner and admins of this project can update GitHub details.
          </p>

          {/* Modal Content */}
          <form onSubmit={handleGitHubIntegration}>
            <div className="mb-4">
              <label className={`block text-sm font-medium mb-1 ${theme.text}`}>
                Repository URL
                <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                type="text"
                value={githubRepo}
                onChange={(e) => setGithubRepo(e.target.value)}
                placeholder="Github Repo Link"
                className={`w-full px-3 py-2 rounded-md outline-none ${theme.text} border-2 ${theme.border}`}
                required
              />
              <p className={`text-xs mt-1 ${theme.textMuted}`}>
                {"Format: https://github.com/<<userName>>/<<repo>>.git"}
              </p>
            </div>

            <div className="mb-6">
              <label className={`block text-sm font-medium mb-1 ${theme.text}`}>
                Personal Access Token
                <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                type="password"
                value={githubToken}
                onChange={(e) => setGithubToken(e.target.value)}
                placeholder="github_pat_xxxxxx"
                className={`w-full px-3 py-2 rounded-md outline-none ${theme.text} border-2 ${theme.border}`}
                required
              />
              <p className={`text-xs mt-1 ${theme.textMuted}`}>
                Token must have repo scope access for repository operations
              </p>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className={`px-4 py-2 rounded-md ${theme.active}`}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={
                  isSubmitting || !githubRepo.trim() || !githubToken.trim()
                }
                className={`px-4 py-2 rounded-md ${theme.statusBar} ${
                  isSubmitting || !githubRepo.trim() || !githubToken.trim()
                    ? "opacity-70 cursor-not-allowed"
                    : ""
                }`}
              >
                {isSubmitting ? (
                  <span className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4"
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
                    Saving...
                  </span>
                ) : (
                  "Update"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default GitHubIntegrationModal;
