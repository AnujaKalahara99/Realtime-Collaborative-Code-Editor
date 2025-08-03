
import { type Codespace, type ViewMode } from "./codespace.types";
import CreateCodespaceCard from "./CreateCodespaceCard";
import CodespaceCard from "./CodespaceCard";

interface Props {
  codespaces: Codespace[];
  viewMode: ViewMode;
  onCreateWorkspace: () => void;
  onDeleteWorkspace: (id: string) => Promise<boolean>;
}

function CodespaceGrid({
  codespaces,
  viewMode,
  onCreateWorkspace,
  onDeleteWorkspace,
}: Props) {
  return (
    <div
      className={`${
        viewMode === "grid"
          ? "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"
          : "space-y-3"
      } mb-8`}
    >
      <CreateCodespaceCard viewMode={viewMode} onClick={onCreateWorkspace} />

      {codespaces.map((codespace) => (
        <CodespaceCard
          key={codespace.id}
          codespace={codespace}
          viewMode={viewMode}
          onDelete={() => onDeleteWorkspace(codespace.id)} 
        />
      ))}
    </div>
  );
}

export default CodespaceGrid;
