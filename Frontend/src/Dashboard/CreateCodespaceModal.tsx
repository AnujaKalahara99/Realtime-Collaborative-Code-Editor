import { useState } from "react";
import { useTheme } from "../ThemeProvider";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (name: string) => Promise<boolean>;
}

function CreateCodespaceModal({ isOpen, onClose, onSubmit }: Props) {
  const { theme } = useTheme();
  const [codespaceName, setCodespaceName] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await onSubmit(codespaceName);
    if (success) {
      setCodespaceName("");
      onClose();
    }
  };

  const handleClose = () => {
    setCodespaceName("");
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className={`${theme.surface} rounded-lg shadow-xl w-full max-w-md`}>
        <div className="p-6">
          <h3 className={`text-lg font-semibold ${theme.text} mb-4`}>
            Create New Codespace
          </h3>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              value={codespaceName}
              onChange={(e) => setCodespaceName(e.target.value)}
              placeholder="Enter codespace name..."
              className={`w-full p-3 ${theme.border} border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${theme.text} mb-6`}
              autoFocus
            />
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                className={`px-4 py-2 ${theme.hover} ${theme.textSecondary} rounded-lg transition-colors`}
                onClick={handleClose}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                disabled={!codespaceName.trim()}
              >
                Create
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CreateCodespaceModal;
