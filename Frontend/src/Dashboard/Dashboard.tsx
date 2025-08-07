import { useState, useEffect } from "react";
import { type Session } from "@supabase/supabase-js";
import { useTheme } from "../ThemeProvider";
import TitleBar from "./TitleBar";
import SearchAndControls from "./SearchAndControls";
import CodespaceGrid from "./CodespaceGrid";
import EmptyState from "./EmptyState";
import CreateCodespaceModal from "./CreateCodespaceModal";
import { useCodespaces } from "./useCodespaces";
import { type ViewMode } from "./codespace.types";
import type { Codespace } from "./codespace.types";

type Props = {
  session: Session;
};

const Dashboard = ({ session }: Props) => {
  console.log("Dashboard rendered");

  const { theme } = useTheme();
  const {
    codespaces,
    createCodespace,
    deleteCodespace,
    shareCodespacebyemail,
    editCodespace,
  } = useCodespaces(session);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const filteredCodespaces = codespaces.filter((codespace: Codespace) =>
    codespace.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateCodespace = async (name: string) => {
    return await createCodespace(name);
  };
  useEffect(() => {
    console.log("Session changed on Dashboard:");
  }, [session]);
  useEffect(() => {
    console.log("Codespaces changed on Dashboard:");
  }, [codespaces]);
  return (
    <div className={`min-h-screen ${theme.surface}`}>
      <TitleBar Session={session} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <SearchAndControls
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          viewMode={viewMode}
          setViewMode={setViewMode}
        />

        <CodespaceGrid
          codespaces={filteredCodespaces}
          viewMode={viewMode}
          onCreateWorkspace={() => setIsModalOpen(true)}
          onDeleteWorkspace={deleteCodespace}
          onEditWorkspace={editCodespace}
          onShareWorkspace={shareCodespacebyemail}
        />

        <EmptyState searchQuery={searchQuery} />
        <CreateCodespaceModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleCreateCodespace}
        />
      </main>
    </div>
  );
};

export default Dashboard;
