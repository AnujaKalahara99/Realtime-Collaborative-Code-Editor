import { useTheme } from "../../Contexts/ThemeProvider";
import { useCodespaceContext } from "../../Contexts/CodespaceContext";

interface Props {
  searchQuery: string;
}

function EmptyState({ searchQuery }: Props) {
  const { theme } = useTheme();
  const { codespaces, loading } = useCodespaceContext();

  const filteredCodespaces = codespaces.filter((codespace) =>
    codespace?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Don't show empty state while loading
  if (loading) return null;

  // If we have workspaces or a search query that returned results, don't show empty state
  if (
    codespaces.length > 0 &&
    (searchQuery === "" || filteredCodespaces.length > 0)
  ) {
    return null;
  }

  // Show empty state with appropriate message
  return (
    <div className="flex flex-col items-center justify-center py-12">
      {codespaces.length === 0 ? (
        <>
          <h3 className="text-xl font-semibold mb-2">No codespaces yet</h3>
          <p className={`${theme.textMuted} mb-6`}>
            Create your first codespace to get started
          </p>
        </>
      ) : (
        <>
          <h3 className="text-xl font-semibold mb-2">No matching codespaces</h3>
          <p className={`${theme.textMuted} mb-6`}>
            Try adjusting your search query
          </p>
        </>
      )}
    </div>
  );
}

export default EmptyState;
