// import { useState, useEffect } from "react";
// import { type Session } from "@supabase/supabase-js";
// import { useTheme } from "../ThemeProvider";
// import TitleBar from "./TitleBar";
// import SearchAndControls from "./SearchAndControls";
// import CodespaceGrid from "./CodespaceGrid";
// import EmptyState from "./EmptyState";
// import CreateCodespaceModal from "./CreateCodespaceModal";
// import { useCodespaces } from "./useCodespaces";
// import { type ViewMode } from "./codespace.types";
// import type { Codespace } from "./codespace.types";

// type Props = {
//   session: Session;
// };

// const Dashboard = ({ session }: Props) => {
//   // console.log("Dashboard rendered");

//   const { theme } = useTheme();
//   const {
//     codespaces,
//     createCodespace,
//     deleteCodespace,
//     shareCodespacebyemail,
//     editCodespace,
//   } = useCodespaces(session);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [viewMode, setViewMode] = useState<ViewMode>("grid");
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const filteredCodespaces = codespaces.filter((codespace: Codespace) =>
//     codespace.name.toLowerCase().includes(searchQuery.toLowerCase())
//   );

//   const handleCreateCodespace = async (name: string) => {
//     return await createCodespace(name);
//   };
//   useEffect(() => {
//     // console.log("Session changed on Dashboard:");
//   }, [session]);
//   useEffect(() => {
//     // console.log("Codespaces changed on Dashboard:");
//   }, [codespaces]);
//   return (
//     <div className={`min-h-screen ${theme.surface}`}>
//       <TitleBar Session={session} />

//       <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//         <SearchAndControls
//           searchQuery={searchQuery}
//           setSearchQuery={setSearchQuery}
//           viewMode={viewMode}
//           setViewMode={setViewMode}
//         />

//         <CodespaceGrid
//           codespaces={filteredCodespaces}
//           viewMode={viewMode}
//           onCreateWorkspace={() => setIsModalOpen(true)}
//           onDeleteWorkspace={deleteCodespace}
//           onEditWorkspace={editCodespace}
//           onShareWorkspace={shareCodespacebyemail}
//         />

//         <EmptyState searchQuery={searchQuery} />
//         <CreateCodespaceModal
//           isOpen={isModalOpen}
//           onClose={() => setIsModalOpen(false)}
//           onSubmit={handleCreateCodespace}
//         />
//       </main>
//     </div>
//   );
// };

// export default Dashboard;
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

  // 🚩 first load spinner state
  const [firstLoad, setFirstLoad] = useState(true);

  const filteredCodespaces = codespaces.filter((codespace: Codespace) =>
    codespace.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateCodespace = async (name: string) => {
    return await createCodespace(name);
  };

  // 🚩 show spinner only on first redirect
  useEffect(() => {
    const timer = setTimeout(() => setFirstLoad(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // console.log("Session changed on Dashboard:");
  }, [session]);

  useEffect(() => {
    // console.log("Codespaces changed on Dashboard:");
  }, [codespaces]);

  // 🚩 render loading spinner if first load
  if (firstLoad) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${theme.surface}`}
      >
        <div className="flex flex-col items-center space-y-2">
          <svg
            className="animate-spin h-10 w-10 text-blue-600"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8H4z"
            ></path>
          </svg>
          <span className={`${theme.text}`}>Loading Dashboard...</span>
        </div>
      </div>
    );
  }

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

        <EmptyState searchQuery={searchQuery} codespaces={filteredCodespaces} /> 
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
