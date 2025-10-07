import { useState } from "react";
import { useTheme } from "../../../Contexts/ThemeProvider";
import { GitBranch, Plus, X } from "lucide-react";

interface CreateBranchProps {
  onCreateBranch: (branchName: string) => void;
  onCancel?: () => void;
}

const CreateBranch = ({ onCreateBranch, onCancel }: CreateBranchProps) => {
  const { theme } = useTheme();
  const [branchName, setBranchName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!branchName.trim()) return;

    setIsCreating(true);
    try {
      await onCreateBranch(branchName.trim());
      setBranchName("");
      onCancel?.();
    } catch (error) {
      console.error("Failed to create branch:", error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleCancel = () => {
    setBranchName("");
    onCancel?.();
  };

  return (
    <div className={`p-4 ${theme.surface} ${theme.border} border rounded-md`}>
      <div className="flex items-center mb-3">
        <GitBranch className="w-4 h-4 mr-2" />
        <h3 className={`text-sm font-medium ${theme.text}`}>
          Create New Branch
        </h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <input
            type="text"
            value={branchName}
            onChange={(e) => setBranchName(e.target.value)}
            placeholder="Enter branch name..."
            className={`w-full px-3 py-2 text-sm ${theme.surface} ${theme.border} border ${theme.text} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
            disabled={isCreating}
            autoFocus
          />
        </div>

        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={handleCancel}
            className={`flex items-center px-3 py-2 text-sm font-medium ${theme.text} ${theme.hover} rounded-md`}
            disabled={isCreating}
          >
            <X className="w-4 h-4 mr-1" />
            Cancel
          </button>

          <button
            type="submit"
            disabled={!branchName.trim() || isCreating}
            className={`flex items-center px-3 py-2 text-sm font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <Plus className="w-4 h-4 mr-1" />
            {isCreating ? "Creating..." : "Create"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateBranch;
