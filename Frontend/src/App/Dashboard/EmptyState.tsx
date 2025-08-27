import { FileText } from "lucide-react";
import { useTheme } from "../../Contexts/ThemeProvider";

interface Props {
  searchQuery: string;
}

function EmptyState({ searchQuery }: Props) {
  const { theme } = useTheme();

  if (!searchQuery) return null;

  return (
    <div className="text-center py-12">
      <FileText size={48} className={`${theme.textMuted} mx-auto mb-4`} />
      <h3 className={`text-lg font-medium ${theme.text} mb-2`}>
        No codespaces found
      </h3>
      <p className={theme.textSecondary}>
        Try searching with different keywords or create a new codespace.
      </p>
    </div>
  );
}

export default EmptyState;
