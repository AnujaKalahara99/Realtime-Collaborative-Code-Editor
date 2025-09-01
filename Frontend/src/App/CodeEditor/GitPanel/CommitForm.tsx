import { useState } from "react";
import { useTheme } from "../../../Contexts/ThemeProvider";
import { Send } from "lucide-react";

interface CommitFormProps {
  onCommit: (message: string) => void;
}

const CommitForm = ({ onCommit }: CommitFormProps) => {
  const { theme } = useTheme();
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onCommit(message);
      setMessage("");
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
        />
        <button
          type="submit"
          disabled={!message.trim()}
          className={`flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          <Send className="w-4 h-4 mr-2" />
          Commit Changes
        </button>
      </form>
    </div>
  );
};

export default CommitForm;
