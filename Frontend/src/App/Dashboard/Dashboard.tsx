import React from "react";
import { useState, useEffect } from "react";
import { type Session } from "@supabase/supabase-js";
import { useTheme } from "../../Contexts/ThemeProvider";
import { useCodespaceContext } from "../../Contexts/CodespaceContext";
import TitleBar from "./TitleBar";
import SearchAndControls from "./SearchAndControls";
import CodespaceGrid from "./CodespaceGrid";
import EmptyState from "./EmptyState";
import CreateCodespaceModal from "./CreateCodespaceModal";
import { type ViewMode } from "./codespace.types";
import { useNavigate } from "react-router";

type Props = {
  session: Session;
};

const Dashboard = ({ session }: Props) => {
  const { theme } = useTheme();
  const { error } = useCodespaceContext();

  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();
    const invitationId = localStorage.getItem("invitationId");
  
  // Display error message if context has an error
  useEffect(() => {
    if (error) {
      console.error("Error:", error);
    }
  }, [error]);

  useEffect(() => {
    if (invitationId) {
      localStorage.removeItem("invitationId");
      navigate(`/codespace/sharebyemail/${invitationId}`);
    }
  }, [invitationId, navigate]);

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
          searchQuery={searchQuery}
          viewMode={viewMode}
          onOpenCreateModal={() => setIsModalOpen(true)}
        />

        <EmptyState searchQuery={searchQuery} />

        <CreateCodespaceModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      </main>
    </div>
  );
};

export default Dashboard;