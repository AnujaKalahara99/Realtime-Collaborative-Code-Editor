import { useRef, useState } from "react";
import { useTheme } from "../../ThemeProvider";

interface InlineEditorProps {
  initialValue: string;
  onSave: (value: string) => void;
  onCancel: () => void;
}

const InlineEditor = ({
  initialValue,
  onSave,
  onCancel,
}: InlineEditorProps) => {
  const { theme } = useTheme();
  const [value, setValue] = useState(initialValue);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = () => {
    if (value.trim()) {
      onSave(value.trim());
    } else {
      onCancel();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSubmit();
    } else if (e.key === "Escape") {
      onCancel();
    }
  };

  // Auto-focus when component mounts
  useState(() => {
    setTimeout(() => inputRef.current?.focus(), 0);
  });

  return (
    <input
      ref={inputRef}
      type="text"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onBlur={handleSubmit}
      onKeyDown={handleKeyDown}
      className={`bg-transparent border ${theme.border} px-1 py-0 text-sm flex-1 min-w-0 ${theme.text}`}
    />
  );
};

export default InlineEditor;
