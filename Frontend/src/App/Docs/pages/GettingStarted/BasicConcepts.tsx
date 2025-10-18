import { useTheme } from "../../../../Contexts/ThemeProvider";
import { Link } from "react-router";
import Breadcrumb from "../../components/Breadcrumb";
import InfoBox from "../../components/InfoBox";

export default function BasicConcepts() {
  const { theme } = useTheme();

  return (
    <div className="max-w-4xl">
      <Breadcrumb
        items={[
          { label: "Documentation", path: "/docs" },
          {
            label: "Getting Started",
            path: "/docs/getting-started/introduction",
          },
          { label: "Basic Concepts" },
        ]}
      />

      <h1 className={`text-4xl font-bold ${theme.text} mb-4`}>
        Basic Concepts
      </h1>

      <p className={`text-lg ${theme.textSecondary} mb-8`}>
        Understand the fundamental concepts that power RTC Editor.
      </p>

      <section className="my-8">
        <h2 className={`text-2xl font-bold ${theme.text} mb-4`}>
          Core Hierarchy
        </h2>

        <div className={`${theme.surfaceSecondary} p-6 rounded-lg mb-4`}>
          <div className="space-y-4">
            <div>
              <h3 className={`text-lg font-semibold ${theme.text} mb-2`}>
                🏢 Workspace → 📁 Codespace → 🌳 Session (Branch)
              </h3>
              <p className={theme.textSecondary}>
                Your organization starts with a workspace, which contains
                multiple codespaces (projects), and each codespace can have
                multiple sessions representing different branches.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="my-8">
        <h2 className={`text-2xl font-bold ${theme.text} mb-4`}>
          1. Codespace
        </h2>

        <div
          className={`${theme.surface} ${theme.border} border rounded-lg p-6`}
        >
          <p className={theme.textSecondary}>
            A <strong className={theme.text}>codespace</strong> is your
            collaborative project environment. It's the top-level container for
            all your code, branches, and collaboration settings.
          </p>

          <h3 className={`font-semibold ${theme.text} mt-4 mb-2`}>
            What a Codespace Includes:
          </h3>
          <ul
            className={`list-disc list-inside space-y-1 ${theme.textSecondary}`}
          >
            <li>Project metadata (name, description, language)</li>
            <li>Member list with their roles and permissions</li>
            <li>Multiple branches (sessions) for parallel development</li>
            <li>Shared collaboration settings</li>
          </ul>

          <h3 className={`font-semibold ${theme.text} mt-4 mb-2`}>
            Key Properties:
          </h3>
          <div className={`${theme.surfaceSecondary} p-4 rounded mt-2`}>
            <ul
              className={`space-y-1 text-sm ${theme.textSecondary} font-mono`}
            >
              <li>
                <strong className={theme.text}>id:</strong> Unique identifier
              </li>
              <li>
                <strong className={theme.text}>name:</strong> Display name
              </li>
              <li>
                <strong className={theme.text}>description:</strong> Project
                description
              </li>
              <li>
                <strong className={theme.text}>language:</strong> Primary
                programming language
              </li>
              <li>
                <strong className={theme.text}>created_at:</strong> Creation
                timestamp
              </li>
              <li>
                <strong className={theme.text}>owner_id:</strong> Creator's user
                ID
              </li>
            </ul>
          </div>
        </div>

        <InfoBox type="info" title="Think of it like...">
          <p>
            A codespace is like a <strong>GitHub repository</strong> - it's the
            container for your entire project.
          </p>
        </InfoBox>
      </section>

      <section className="my-8">
        <h2 className={`text-2xl font-bold ${theme.text} mb-4`}>
          2. Session (Branch)
        </h2>

        <div
          className={`${theme.surface} ${theme.border} border rounded-lg p-6`}
        >
          <p className={theme.textSecondary}>
            A <strong className={theme.text}>session</strong> represents a
            specific branch within your codespace. Each session has its own
            independent file system state, allowing parallel development
            workflows.
          </p>

          <h3 className={`font-semibold ${theme.text} mt-4 mb-2`}>
            Session Characteristics:
          </h3>
          <ul
            className={`list-disc list-inside space-y-1 ${theme.textSecondary}`}
          >
            <li>Each session corresponds to a Git-like branch</li>
            <li>Has its own file tree and content</li>
            <li>Independent commit history</li>
            <li>Real-time collaboration is scoped to the session</li>
            <li>Default "main" session created with every codespace</li>
          </ul>

          <h3 className={`font-semibold ${theme.text} mt-4 mb-2`}>
            Use Cases:
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
            <div className={`${theme.surfaceSecondary} p-3 rounded`}>
              <p className={`font-semibold ${theme.text} text-sm mb-1`}>
                🌱 Feature Development
              </p>
              <p className={`text-xs ${theme.textSecondary}`}>
                Create a new session for each feature
              </p>
            </div>
            <div className={`${theme.surfaceSecondary} p-3 rounded`}>
              <p className={`font-semibold ${theme.text} text-sm mb-1`}>
                🐛 Bug Fixes
              </p>
              <p className={`text-xs ${theme.textSecondary}`}>
                Isolate bug fixes in dedicated sessions
              </p>
            </div>
            <div className={`${theme.surfaceSecondary} p-3 rounded`}>
              <p className={`font-semibold ${theme.text} text-sm mb-1`}>
                🧪 Experiments
              </p>
              <p className={`text-xs ${theme.textSecondary}`}>
                Try new ideas without affecting main
              </p>
            </div>
            <div className={`${theme.surfaceSecondary} p-3 rounded`}>
              <p className={`font-semibold ${theme.text} text-sm mb-1`}>
                👥 Team Workflows
              </p>
              <p className={`text-xs ${theme.textSecondary}`}>
                Different teams work on different sessions
              </p>
            </div>
          </div>
        </div>

        <InfoBox type="info" title="Think of it like...">
          <p>
            A session is like a <strong>Git branch</strong> - an independent
            line of development within your project.
          </p>
        </InfoBox>
      </section>

      <section className="my-8">
        <h2 className={`text-2xl font-bold ${theme.text} mb-4`}>
          3. Real-time Collaboration
        </h2>

        <div
          className={`${theme.surface} ${theme.border} border rounded-lg p-6`}
        >
          <p className={theme.textSecondary}>
            RTC Editor uses{" "}
            <strong className={theme.text}>
              Conflict-free Replicated Data Types (CRDTs)
            </strong>
            via Yjs to enable seamless real-time collaboration.
          </p>

          <h3 className={`font-semibold ${theme.text} mt-4 mb-2`}>
            How It Works:
          </h3>
          <ol
            className={`list-decimal list-inside space-y-2 ${theme.textSecondary}`}
          >
            <li>You join a session (branch) in a codespace</li>
            <li>Your editor connects to the WebSocket server</li>
            <li>Changes are synchronized via Yjs CRDT algorithm</li>
            <li>All collaborators see updates in real-time</li>
            <li>Conflicts are automatically resolved</li>
          </ol>

          <div className={`${theme.surfaceSecondary} p-4 rounded mt-4`}>
            <h4 className={`font-semibold ${theme.text} mb-2`}>
              What Gets Synchronized:
            </h4>
            <ul
              className={`list-disc list-inside space-y-1 text-sm ${theme.textSecondary}`}
            >
              <li>File content changes (character-level)</li>
              <li>File tree structure (create, delete, rename)</li>
              <li>Cursor positions and selections</li>
              <li>Chat messages</li>
              <li>User presence (who's online)</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="my-8">
        <h2 className={`text-2xl font-bold ${theme.text} mb-4`}>
          4. Version Control
        </h2>

        <div
          className={`${theme.surface} ${theme.border} border rounded-lg p-6`}
        >
          <p className={theme.textSecondary}>
            Built-in version control provides Git-like functionality without the
            complexity.
          </p>

          <h3 className={`font-semibold ${theme.text} mt-4 mb-2`}>
            Key Features:
          </h3>

          <div className="space-y-3 mt-3">
            <div className={`${theme.surfaceSecondary} p-3 rounded`}>
              <p className={`font-semibold ${theme.text} mb-1`}>📸 Commits</p>
              <p className={`text-sm ${theme.textSecondary}`}>
                Create snapshots of your entire session state. Each commit
                includes all files and their content at that point in time.
              </p>
            </div>

            <div className={`${theme.surfaceSecondary} p-3 rounded`}>
              <p className={`font-semibold ${theme.text} mb-1`}>⏮️ Rollback</p>
              <p className={`text-sm ${theme.textSecondary}`}>
                Restore your session to any previous commit. This replaces the
                current state with the selected commit's state.
              </p>
            </div>

            <div className={`${theme.surfaceSecondary} p-3 rounded`}>
              <p className={`font-semibold ${theme.text} mb-1`}>🌳 Branches</p>
              <p className={`text-sm ${theme.textSecondary}`}>
                Create new sessions (branches) from existing ones to develop
                features in parallel.
              </p>
            </div>

            <div className={`${theme.surfaceSecondary} p-3 rounded`}>
              <p className={`font-semibold ${theme.text} mb-1`}>📜 History</p>
              <p className={`text-sm ${theme.textSecondary}`}>
                View the complete commit history with timestamps, messages, and
                authors.
              </p>
            </div>
          </div>
        </div>

        <InfoBox type="warning" title="Important Note">
          <p>
            Rollback is destructive - it replaces your current state. Make sure
            to commit any important changes before performing a rollback!
          </p>
        </InfoBox>
      </section>

      <section className="my-8">
        <h2 className={`text-2xl font-bold ${theme.text} mb-4`}>
          5. Roles and Permissions
        </h2>

        <div
          className={`${theme.surface} ${theme.border} border rounded-lg p-6`}
        >
          <p className={theme.textSecondary}>
            Control who can do what in your codespace with role-based access
            control.
          </p>

          <div className="space-y-4 mt-4">
            <div
              className={`${theme.surfaceSecondary} p-4 rounded border-l-4 border-red-500`}
            >
              <h3 className={`font-semibold ${theme.text} mb-2`}>🔴 Admin</h3>
              <ul
                className={`list-disc list-inside space-y-1 text-sm ${theme.textSecondary}`}
              >
                <li>Full control over the codespace</li>
                <li>Can edit, commit, and rollback</li>
                <li>Manage members and their roles</li>
                <li>Delete the codespace</li>
              </ul>
            </div>

            <div
              className={`${theme.surfaceSecondary} p-4 rounded border-l-4 border-blue-500`}
            >
              <h3 className={`font-semibold ${theme.text} mb-2`}>
                🔵 Developer
              </h3>
              <ul
                className={`list-disc list-inside space-y-1 text-sm ${theme.textSecondary}`}
              >
                <li>Edit files and commit changes</li>
                <li>Create and switch branches</li>
                <li>Use chat and AI assistant</li>
                <li>Cannot manage members or delete codespace</li>
              </ul>
            </div>

            {/* <div
              className={`${theme.surfaceSecondary} p-4 rounded border-l-4 border-green-500`}
            >
              <h3 className={`font-semibold ${theme.text} mb-2`}>🟢 Learner</h3>
              <ul
                className={`list-disc list-inside space-y-1 text-sm ${theme.textSecondary}`}
              >
                <li>View-only access to code</li>
                <li>Can see other users' cursors</li>
                <li>Participate in chat</li>
                <li>Cannot edit files or commit</li>
                <li>Perfect for students and observers</li>
              </ul>
            </div> */}
          </div>
        </div>
      </section>

      <section className="my-8">
        <h2 className={`text-2xl font-bold ${theme.text} mb-4`}>
          6. File Persistence
        </h2>

        <div
          className={`${theme.surface} ${theme.border} border rounded-lg p-6`}
        >
          <p className={theme.textSecondary}>
            Your files are automatically saved to the cloud as you type.
          </p>

          <h3 className={`font-semibold ${theme.text} mt-4 mb-2`}>
            How It Works:
          </h3>
          <ol
            className={`list-decimal list-inside space-y-2 ${theme.textSecondary}`}
          >
            <li>Changes are debounced (3-second delay)</li>
            <li>File metadata saved to PostgreSQL database</li>
            <li>File content stored in Supabase Storage</li>
            <li>Yjs document state persisted for collaboration</li>
            <li>Everything synced when you close the editor</li>
          </ol>

          <div className={`${theme.surfaceSecondary} p-4 rounded mt-4`}>
            <p className={`text-sm ${theme.textSecondary}`}>
              <strong className={theme.text}>Pro Tip:</strong> You never lose
              work! Even if your browser crashes, your last auto-save will be
              restored when you reopen the codespace.
            </p>
          </div>
        </div>
      </section>

      <section className="my-8">
        <h2 className={`text-2xl font-bold ${theme.text} mb-4`}>
          Putting It All Together
        </h2>

        <div className={`${theme.surfaceSecondary} p-6 rounded-lg`}>
          <h3 className={`font-semibold ${theme.text} mb-3`}>
            Typical Workflow:
          </h3>
          <ol
            className={`list-decimal list-inside space-y-2 ${theme.textSecondary}`}
          >
            <li>
              Create a <strong className={theme.text}>codespace</strong> for
              your project
            </li>
            <li>
              Invite team members with appropriate{" "}
              <strong className={theme.text}>roles</strong>
            </li>
            <li>
              Work on the default "main"{" "}
              <strong className={theme.text}>session</strong>
            </li>
            <li>
              Create new <strong className={theme.text}>sessions</strong> for
              features or experiments
            </li>
            <li>
              Edit files with{" "}
              <strong className={theme.text}>real-time collaboration</strong>
            </li>
            <li>
              Make regular <strong className={theme.text}>commits</strong> to
              save progress
            </li>
            <li>
              Use <strong className={theme.text}>rollback</strong> if you need
              to undo changes
            </li>
            <li>Switch between sessions to work on different features</li>
          </ol>
        </div>
      </section>

      <section className="my-8">
        <h2 className={`text-2xl font-bold ${theme.text} mb-4`}>Next Steps</h2>

        <div className="flex flex-col gap-3">
          <Link
            to="/docs/features/real-time-collaboration"
            className={`${theme.surface} ${theme.border} border ${theme.hover} p-4 rounded-lg flex items-center justify-between`}
          >
            <div>
              <h3 className={`font-semibold ${theme.text}`}>
                Real-time Collaboration
              </h3>
              <p className={`text-sm ${theme.textSecondary}`}>
                Deep dive into collaborative features
              </p>
            </div>
            <span className={theme.text}>→</span>
          </Link>

          <Link
            to="/docs/features/version-control"
            className={`${theme.surface} ${theme.border} border ${theme.hover} p-4 rounded-lg flex items-center justify-between`}
          >
            <div>
              <h3 className={`font-semibold ${theme.text}`}>Version Control</h3>
              <p className={`text-sm ${theme.textSecondary}`}>
                Master commits, branches, and rollbacks
              </p>
            </div>
            <span className={theme.text}>→</span>
          </Link>

          <Link
            to="/docs/guides/managing-codespaces"
            className={`${theme.surface} ${theme.border} border ${theme.hover} p-4 rounded-lg flex items-center justify-between`}
          >
            <div>
              <h3 className={`font-semibold ${theme.text}`}>
                Managing Codespaces
              </h3>
              <p className={`text-sm ${theme.textSecondary}`}>
                Advanced codespace management
              </p>
            </div>
            <span className={theme.text}>→</span>
          </Link>
        </div>
      </section>
    </div>
  );
}
