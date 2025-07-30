// import { useNavigate } from "react-router-dom";
// import { type Session } from "@supabase/supabase-js";
// import { supabase } from "../database/superbase";

// type Props = {
//   session: Session;
// };

// function Dashboard({ session }: Props) {
//   const navigate = useNavigate();
//   const user = session.user;
//   const name = user.user_metadata.full_name || user.email;
//   const avatar = user.user_metadata.avatar_url;
// console.log(session);
//   const signOut = async () => {
//     await supabase.auth.signOut();
//     navigate("/login");
//   };
//   const Codeeditor = async () => {
//     await supabase.auth.signOut();
//     navigate("/codeeditor");
//   };
//   return (
//     <div>
//       <h2>Welcome, {name}</h2>
//       {avatar && <img src={avatar} alt="profile" style={{ width: 80, borderRadius: "50%" }} />}
//       <p>{user.email}</p>
//       <button onClick={signOut}>Sign Out</button>
//       <button onClick={Codeeditor}>Code editor</button>
//     </div>
//   );
// }

// export default Dashboard;

import { useNavigate } from "react-router-dom";
import { type Session } from "@supabase/supabase-js";
import { supabase } from "../database/superbase";
import { useState, useEffect } from "react";

type Props = {
  session: Session;
};

function Dashboard({ session }: Props) {
  const navigate = useNavigate();
  const user = session.user;
  const name = user.user_metadata.full_name || user.email;
  const avatar = user.user_metadata.avatar_url;
  console.log(avatar);
  const [workspaces, setWorkspaces] = useState<{ id: string; name: string }[]>([]);
  const [newWorkspaceName, setNewWorkspaceName] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch workspaces on mount
//   useEffect(() => {
//     fetchWorkspaces();
//   }, []);

//   async function fetchWorkspaces() {
//     const { data, error } = await supabase
//       .from("workspaces")
//       .select("id, name")
//       .eq("user_id", user.id);
//     if (error) {
//       console.error("Error fetching workspaces:", error.message);
//       return;
//     }
//     setWorkspaces(data || []);
//   }

//   async function createWorkspace(e: React.FormEvent) {
//     e.preventDefault();
//     if (!newWorkspaceName.trim()) return;

//     const { error } = await supabase
//       .from("workspaces")
//       .insert({ user_id: user.id, name: newWorkspaceName });
//     if (error) {
//       console.error("Error creating workspace:", error.message);
//       return;
//     }
//     setNewWorkspaceName("");
//     setIsModalOpen(false);
//     fetchWorkspaces();
//   }

  async function signOut() {
    await supabase.auth.signOut();
    navigate("/login");
  }

  function goToCodeEditor() {
    navigate("/codeeditor");
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-md">
        <div className="p-4">
          <h2 className="text-xl font-bold text-gray-800">Workspaces</h2>
          <button
            className="mt-4 w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
            onClick={() => setIsModalOpen(true)}
          >
            Create Workspace
          </button>
        </div>
        <ul className="mt-2">
          {workspaces.map((workspace) => (
            <li
              key={workspace.id}
              className="px-4 py-2 text-gray-700 hover:bg-gray-200 cursor-pointer"
            >
              {workspace.name}
            </li>
          ))}
        </ul>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white shadow-md p-4 flex justify-between items-center">
          <h2 className="text-2xl font-semibold text-gray-800">Welcome, {name}</h2>
          <div className="flex items-center space-x-4">
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
              onClick={goToCodeEditor}
            >
              Code Editor
            </button>
            <button
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition"
              onClick={signOut}
            >
              Sign Out
            </button>
           {avatar && (
  <img
    src={avatar} // Use the avatar variable, not the string "avatar"
    alt="profile"
    className="w-12 h-12 rounded-full object-cover"
  />
)}
          </div>
        </div>

        {/* Document Area */}
        <div className="flex-1 p-6 bg-white m-4 rounded-lg shadow-md">
          <div className="max-w-4xl mx-auto bg-white p-8 border border-gray-200 rounded-lg min-h-[600px]">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Document Workspace
            </h3>
            <p className="text-gray-600">
              Select a workspace from the sidebar or create a new one to start
              working on your documents.
            </p>
          </div>
        </div>
      </div>

      {/* Modal for Creating Workspace */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Create New Workspace
            </h3>
            <form onSubmit={createWorkspace}>
              <input
                type="text"
                value={newWorkspaceName}
                onChange={(e) => setNewWorkspaceName(e.target.value)}
                placeholder="Workspace Name"
                className="w-full p-2 border border-gray-300 rounded-md mb-4"
              />
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;