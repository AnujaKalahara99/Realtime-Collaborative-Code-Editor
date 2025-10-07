import { useState } from "react";
import { useTheme } from "../../../Contexts/ThemeProvider";
import { ChevronDown, GitBranch, Plus } from "lucide-react";
import { useEditorCollaboration } from "../../../Contexts/EditorContext";
import CreateBranch from "./CreateBranch";

const BranchSelector = () => {
  const { theme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [showCreateBranch, setShowCreateBranch] = useState(false);
  const {
    codespace,
    activeSessionIndex,
    setActiveSessionIndex,
    createBranchWithSession,
  } = useEditorCollaboration();

  const branchSessions = codespace?.sessions || [];
  const activeBranch = branchSessions[activeSessionIndex].name || "main";

  const toggleDropdown = () => setIsOpen(!isOpen);

  const handleCreateBranch = async (branchName: string) => {
    setShowCreateBranch(false);
    createBranchWithSession(branchName);
  };

  if (showCreateBranch) {
    return (
      <CreateBranch
        onCreateBranch={handleCreateBranch}
        onCancel={() => setShowCreateBranch(false)}
      />
    );
  }

  return (
    <div className="space-y-2">
      <div className="relative">
        <button
          className={`flex items-center justify-between w-full px-3 py-2 text-sm font-medium ${theme.surface} ${theme.border} border ${theme.text} ${theme.hover} rounded-md`}
          onClick={toggleDropdown}
          aria-haspopup="true"
          aria-expanded={isOpen}
        >
          <span className="flex items-center">
            <GitBranch className="w-4 h-4 mr-2" />
            {activeBranch}
          </span>
          <ChevronDown className="w-4 h-4" />
        </button>

        {isOpen && (
          <div
            className={`absolute z-10 w-full mt-1 overflow-auto rounded-md shadow-lg ${theme.surface} ${theme.border} border max-h-60`}
          >
            <ul
              className="py-1 text-sm"
              role="menu"
              aria-orientation="vertical"
            >
              {branchSessions.map((branch, index) => {
                return (
                  <li key={branch.branchId}>
                    <button
                      className={`block w-full text-left px-4 py-2 ${
                        theme.text
                      } ${index === activeSessionIndex ? theme.active : ""} ${
                        theme.hover
                      }`}
                      role="menuitem"
                      onClick={() => setActiveSessionIndex(index)}
                    >
                      {branch.name}
                    </button>
                  </li>
                );
              })}
              <li className={`border-t ${theme.border}`}>
                <button
                  className={`flex items-center w-full text-left px-4 py-2 ${theme.text} ${theme.hover}`}
                  onClick={() => {
                    setShowCreateBranch(true);
                    setIsOpen(false);
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create new branch
                </button>
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default BranchSelector;
