import { useState } from "react";
import { useTheme } from "../../../Contexts/ThemeProvider";
// import type { Branch } from "./GitTypes";
import { ChevronDown, GitBranch } from "lucide-react";
import { useEditorCollaboration } from "../../../Contexts/EditorContext";

// interface BranchSelectorProps {
//   branches: Branch[];
//   onBranchSelect: (branchName: string) => void;
// }

const BranchSelector = () => {
  const { theme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const { codespace, activeSessionIndex, setActiveSessionIndex } =
    useEditorCollaboration();

  // Get the current active branch
  // const activeBranch = branches.find((b) => b.isActive)?.name || "main";
  const branchSessions = codespace?.sessions || [];

  const activeBranch = branchSessions[activeSessionIndex].name || "main";

  const toggleDropdown = () => setIsOpen(!isOpen);

  // const handleBranchSelect = (branchName: string) => {
  //   onBranchSelect(branchName);
  //   setIsOpen(false);
  // };

  return (
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
          <ul className="py-1 text-sm" role="menu" aria-orientation="vertical">
            {branchSessions.map((branch, index) => (
              <li key={branch.branchId}>
                <button
                  className={`block w-full text-left px-4 py-2 ${theme.text} ${
                    index === activeSessionIndex ? theme.active : ""
                  } ${theme.hover}`}
                  role="menuitem"
                  // onClick={() => handleBranchSelect(branch.name)}
                  onClick={() => setActiveSessionIndex(index)}
                >
                  {branch.name}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default BranchSelector;
