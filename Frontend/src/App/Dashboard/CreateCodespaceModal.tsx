import { useState } from "react";
import { useCodespaceContext } from "../../Contexts/CodespaceContext";
import { useTheme } from "../../Contexts/ThemeProvider";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

function CreateCodespaceModal({ isOpen, onClose }: Props) {
  const { theme } = useTheme();
  const { createCodespace } = useCodespaceContext();
  const [codespaceInput, setCodespaceInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!codespaceInput.trim()) {
      setErrorMessage("Codespace name cannot be empty");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const success = await createCodespace(codespaceInput);
      if (success) {
        setCodespaceInput("");
        onClose();
      } else {
        setErrorMessage("Failed to create codespace");
      }
    } catch (error) {
      setErrorMessage(
        "An error occurred while creating the codespace: " + error
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div
        className={`${theme.surface} p-6 rounded-lg shadow-lg w-full max-w-md`}
      >
        <h2 className={`text-xl font-semibold mb-4 ${theme.text}`}>
          Create New Codespace
        </h2>
        <form onSubmit={handleSubmit}>
          <label
            htmlFor="workspace-name"
            className={`block mb-2 text-sm font-medium ${theme.text}`}
          >
            Name
          </label>
          <input
            type="text"
            id="workspace-name"
            className={`w-full px-3 py-2 border ${theme.border} rounded-md ${theme.surface} ${theme.text}`}
            placeholder="Enter codespace name"
            value={codespaceInput}
            onChange={(e) => setCodespaceInput(e.target.value)}
            autoFocus
          />

          {errorMessage && (
            <p className="mt-2 text-sm text-red-600">{errorMessage}</p>
          )}

          <div className="mt-6 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setCodespaceInput("");
                setErrorMessage("");
                onClose();
              }}
              className={`px-4 py-2 ${theme.surfaceSecondary} ${theme.text} text-sm rounded ${theme.hover}`}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating..." : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateCodespaceModal;