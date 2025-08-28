
import { FileText } from "lucide-react";
import { useTheme } from "../../Contexts/ThemeProvider";

interface Props {
  searchQuery: string;
  codespaces: any[]; // or Codespace[]
}

function EmptyState({ searchQuery, codespaces }: Props) {
  const { theme } = useTheme();

  // Show only if no codespaces match
  if (codespaces.length > 0) return null;

  return (
    <div className="text-center py-12">
      <FileText size={48} className={`${theme.textMuted} mx-auto mb-4`} />
      <h3 className={`text-lg font-medium ${theme.text} mb-2`}>
        {searchQuery ? "No codespaces found" : "No codespaces yet"}
      </h3>
      <p className={theme.textSecondary}>
        {searchQuery
          ? "Try searching with different keywords."
          : "Create a new codespace to get started."}
      </p>
    </div>
  );
}

export default EmptyState;
