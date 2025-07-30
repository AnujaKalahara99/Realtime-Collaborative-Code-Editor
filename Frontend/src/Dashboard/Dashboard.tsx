// import { useNavigate } from "react-router";
import { type Session } from "@supabase/supabase-js";
import { useState } from "react";
import { useTheme } from "../ThemeProvider";
import { Plus, FileText, MoreVertical, Search, Grid, Menu } from "lucide-react";
import TitleBar from "./TitleBar";

type Props = {
  session: Session;
};

interface Workspace {
  id: string;
  name: string;
  lastModified: string;
  owner: string;
}

function Dashboard({ session }: Props) {
  const { theme } = useTheme();
  const user = session.user;
  const name = user.user_metadata.full_name || user.email;
  // const avatar = user.user_metadata.avatar_url;

  const [workspaces, setWorkspaces] = useState<Workspace[]>([
    {
      id: "1",
      name: "Project Documentation",
      lastModified: "2 hours ago",
      owner: name,
    },
    {
      id: "2",
      name: "API Design Notes",
      lastModified: "Yesterday",
      owner: name,
    },
    {
      id: "3",
      name: "Meeting Notes - Q4",
      lastModified: "3 days ago",
      owner: name,
    },
  ]);
  const [newWorkspaceName, setNewWorkspaceName] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const createWorkspace = (e: React.FormEvent) => {
    e.preventDefault();
    if (newWorkspaceName.trim()) {
      const newWorkspace: Workspace = {
        id: Date.now().toString(),
        name: newWorkspaceName,
        lastModified: "Just now",
        owner: name,
      };
      setWorkspaces([newWorkspace, ...workspaces]);
      setNewWorkspaceName("");
      setIsModalOpen(false);
    }
  };

  const filteredWorkspaces = workspaces.filter((workspace) =>
    workspace.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={`min-h-screen ${theme.surface}`}>
      <TitleBar Session={session} />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div className="relative flex-1 max-w-md">
            <Search
              className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${theme.textMuted}`}
              size={20}
            />
            <input
              type="text"
              placeholder="Search workspaces..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 ${theme.border} border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${theme.text}`}
            />
          </div>

          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === "grid"
                    ? `${theme.active} ${theme.text}`
                    : `${theme.hover} ${theme.textSecondary}`
                }`}
              >
                <Grid size={18} />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === "list"
                    ? `${theme.active} ${theme.text}`
                    : `${theme.hover} ${theme.textSecondary}`
                }`}
              >
                <Menu size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Create New Workspace Card */}
        <div
          className={`${
            viewMode === "grid"
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              : "space-y-3"
          } mb-8`}
        >
          <div
            onClick={() => setIsModalOpen(true)}
            className={`${theme.surface} ${
              theme.border
            } border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer ${
              theme.hover
            } transition-colors min-h-[200px] ${
              viewMode === "list" ? "!min-h-[80px] flex-row justify-start" : ""
            }`}
          >
            <Plus
              size={viewMode === "grid" ? 48 : 24}
              className={`${theme.textMuted} ${
                viewMode === "list" ? "mr-4" : "mb-4"
              }`}
            />
            <span
              className={`${theme.textSecondary} font-medium ${
                viewMode === "list" ? "text-base" : "text-lg"
              }`}
            >
              Create New Workspace
            </span>
          </div>

          {/* Workspace Cards */}
          {filteredWorkspaces.map((workspace) => (
            <div
              key={workspace.id}
              className={`${theme.surfaceSecondary} rounded-lg ${
                theme.border
              } border ${
                theme.hover
              } cursor-pointer transition-all duration-200 hover:shadow-md ${
                viewMode === "grid"
                  ? "p-6 min-h-[200px] flex flex-col"
                  : "p-4 flex items-center justify-between"
              }`}
            >
              <div
                className={`${
                  viewMode === "grid" ? "flex-1" : "flex items-center space-x-4"
                }`}
              >
                <div
                  className={`${theme.surfaceSecondary} rounded-lg p-3 w-fit ${
                    viewMode === "list" ? "!p-2" : ""
                  }`}
                >
                  <FileText
                    size={viewMode === "grid" ? 32 : 20}
                    className="text-blue-500"
                  />
                </div>

                <div className={`${viewMode === "grid" ? "mt-4" : ""}`}>
                  <h3
                    className={`font-medium ${theme.text} ${
                      viewMode === "grid" ? "text-lg mb-2" : "text-base"
                    }`}
                  >
                    {workspace.name}
                  </h3>
                  <div
                    className={`text-sm ${theme.textMuted} ${
                      viewMode === "grid"
                        ? "space-y-1"
                        : "flex items-center space-x-4"
                    }`}
                  >
                    <p>Modified {workspace.lastModified}</p>
                    <p>{workspace.owner}</p>
                  </div>
                </div>
              </div>

              <button
                className={`${theme.hover} p-2 rounded-lg transition-colors ${
                  viewMode === "grid" ? "self-end mt-4" : ""
                }`}
              >
                <MoreVertical size={16} className={theme.textMuted} />
              </button>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredWorkspaces.length === 0 && searchQuery && (
          <div className="text-center py-12">
            <FileText size={48} className={`${theme.textMuted} mx-auto mb-4`} />
            <h3 className={`text-lg font-medium ${theme.text} mb-2`}>
              No workspaces found
            </h3>
            <p className={theme.textSecondary}>
              Try searching with different keywords or create a new workspace.
            </p>
          </div>
        )}
      </main>

      {/* Create Workspace Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div
            className={`${theme.surface} rounded-lg shadow-xl w-full max-w-md`}
          >
            <div className="p-6">
              <h3 className={`text-lg font-semibold ${theme.text} mb-4`}>
                Create New Workspace
              </h3>
              <form onSubmit={createWorkspace}>
                <input
                  type="text"
                  value={newWorkspaceName}
                  onChange={(e) => setNewWorkspaceName(e.target.value)}
                  placeholder="Enter workspace name..."
                  className={`w-full p-3 ${theme.border} border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${theme.text} mb-6`}
                  autoFocus
                />
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    className={`px-4 py-2 ${theme.hover} ${theme.textSecondary} rounded-lg transition-colors`}
                    onClick={() => {
                      setIsModalOpen(false);
                      setNewWorkspaceName("");
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    disabled={!newWorkspaceName.trim()}
                  >
                    Create
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
