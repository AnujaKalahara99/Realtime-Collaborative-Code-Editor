import { useCodespaceContext } from "../../Contexts/CodespaceContext";
import { type ViewMode } from "./codespace.types";
import CreateCodespaceCard from "./CreateCodespaceCard";
import CodespaceCard from "./CodespaceCard";

interface Props {
  searchQuery: string;
  viewMode: ViewMode;
  onOpenCreateModal: () => void;
}

function CodespaceGrid({ searchQuery, viewMode, onOpenCreateModal }: Props) {
  const { codespaces, loading } = useCodespaceContext();

  // Filter codespaces based on search query with null check
  const filteredCodespaces = codespaces.filter((codespace) =>
    codespace?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div
          role="status"
          className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"
        ></div>
      </div>
    );
  }

  return (
    <div
      className={`${
        viewMode === "grid"
          ? "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"
          : "space-y-3"
      } mb-8`}
    >
      <CreateCodespaceCard viewMode={viewMode} onClick={onOpenCreateModal} />

      {filteredCodespaces.map((codespace) => (
        <CodespaceCard
          key={codespace.id}
          codespace={codespace}
          viewMode={viewMode}
        />
      ))}
    </div>
  );
}

export default CodespaceGrid;
