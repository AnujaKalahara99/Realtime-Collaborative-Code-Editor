import React from "react";
import { useTheme } from "../../../Contexts/ThemeProvider";
import { useEditorCollaboration } from "../../../Contexts/EditorContext";

interface GitHubIntegrationButtonProps {
  onOpenModal: () => void;
}

const GitHubIntegrationButton: React.FC<GitHubIntegrationButtonProps> = ({
  onOpenModal,
}) => {
  const { theme } = useTheme();
  const { codespace } = useEditorCollaboration();

  return (
    <div className={`px-4 py-3 ${theme.border} border-b`}>
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-sm font-medium">GitHub Repository</h3>
          <p
            className={`text-xs ${theme.textMuted} max-w-44 truncate`}
            title={codespace?.gitHubRepo || "No repository linked"}
          >
            {codespace?.gitHubRepo
              ? codespace.gitHubRepo
              : "No repository linked"}
          </p>
        </div>
        <button
          onClick={onOpenModal}
          className={`px-3 py-1 text-sm rounded-md ${theme.active}`}
        >
          {codespace?.gitHubRepo ? "Update" : "Link"}
        </button>
      </div>
    </div>
  );
};

export default GitHubIntegrationButton;
