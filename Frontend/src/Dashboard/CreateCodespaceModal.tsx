
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

  // frontend-only states
  const [language, setLanguage] = useState("javascript");
  const [visibility, setVisibility] = useState("private");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const success = await onSubmit(codespaceName);

    if (success) {
      setCodespaceName("");
      setLanguage("javascript"); 
      setVisibility("private");  
      onClose();
    }
  };

  const handleClose = () => {
    setCodespaceName("");
    setLanguage("javascript");
    setVisibility("private");
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className={`${theme.surface} rounded-lg shadow-xl w-full max-w-md`}>
        <div className="p-6">
          <h3 className={`text-lg font-semibold ${theme.text} mb-4`}>
            Create New Codespace
          </h3>
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Codespace Name */}
            <input
              type="text"
              value={codespaceName}
              onChange={(e) => setCodespaceName(e.target.value)}
              placeholder="Enter codespace name..."
              className={`w-full p-3 ${theme.border} border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${theme.text}`}
              autoFocus
            />

            <div>
              <label className={`block mb-2 text-sm font-medium ${theme.text}`}>
                Language
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className={`w-full p-3 ${theme.border} border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${theme.text} ${theme.surface}`}
              >
                <option value="javascript">JavaScript</option>
                <option value="python">Python</option>
                <option value="java">Java</option>
                <option value="cpp">C++</option>
                <option value="go">Go</option>
              </select>
            </div>

            <div>
              <label className={`block mb-2 text-sm font-medium ${theme.text}`}>
                Visibility
              </label>
              <div className="flex space-x-3">
                {["private", "public", "organization"].map((option) => (
                  <label
                    key={option}
                    className={`flex items-center space-x-2 p-2 border rounded-lg cursor-pointer ${theme.border} ${theme.surface}`}
                  >
                    <input
                      type="radio"
                      value={option}
                      checked={visibility === option}
                      onChange={(e) => setVisibility(e.target.value)}
                      className="form-radio text-blue-500"
                    />
                    <span className={theme.text}>
                      {option.charAt(0).toUpperCase() + option.slice(1)}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-2">
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
