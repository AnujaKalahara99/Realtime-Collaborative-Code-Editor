import { useState } from "react";
import { useTheme } from "../../../Contexts/ThemeProvider";
import { Send, Loader2 } from "lucide-react";
import { useEditorCollaboration } from "../../../Contexts/EditorContext";

const CommitForm = () => {
  const { theme } = useTheme();
  const { commitChanges, gitOperationLoading } = useEditorCollaboration();
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      const success = await commitChanges(message);
      if (success) {
        setMessage("");
      }
    }
  };

  return (
    <div className={`mt-4 ${theme.border} border-t pt-4`}>
      <form onSubmit={handleSubmit} className="flex flex-col">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Commit message..."
          className={`w-full px-3 py-2 text-sm ${theme.surface} ${theme.border} border ${theme.text} focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none min-h-[60px] mb-2`}
          required
          disabled={gitOperationLoading}
        />
        <button
          type="submit"
          disabled={!message.trim() || gitOperationLoading}
          className={`flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {gitOperationLoading ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Send className="w-4 h-4 mr-2" />
          )}
          {gitOperationLoading ? "Committing..." : "Commit Changes"}
        </button>
      </form>
    </div>
  );
};

export default CommitForm;
