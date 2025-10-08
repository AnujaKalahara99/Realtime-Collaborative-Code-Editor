import { useTheme } from "../../../../Contexts/ThemeProvider";
import { Link } from "react-router";
import Breadcrumb from "../../components/Breadcrumb";
import InfoBox from "../../components/InfoBox";
import CodeBlock from "../../components/CodeBlock";

export default function FirstCodespace() {
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
          { label: "First Codespace" },
        ]}
      />

      <h1 className={`text-4xl font-bold ${theme.text} mb-4`}>
        Create Your First Codespace
      </h1>

      <p className={`text-lg ${theme.textSecondary} mb-8`}>
        Learn how to create and configure your first collaborative coding
        workspace.
      </p>

      <section className="my-8">
        <h2 className={`text-2xl font-bold ${theme.text} mb-4`}>
          What is a Codespace?
        </h2>

        <div className={`${theme.surfaceSecondary} p-6 rounded-lg mb-4`}>
          <p className={theme.textSecondary}>
            A <strong className={theme.text}>codespace</strong> is a
            collaborative workspace where you and your team can work together on
            code in real-time. Think of it as a shared project environment that
            includes:
          </p>
          <ul
            className={`list-disc list-inside mt-3 space-y-1 ${theme.textSecondary}`}
          >
            <li>A file system for organizing your code</li>
            <li>Version control with Git-like branches and commits</li>
            <li>Real-time collaboration features</li>
            <li>Role-based access control for team members</li>
          </ul>
        </div>

        <InfoBox type="info" title="Codespace vs Session">
          <p>
            A <strong>codespace</strong> is the overall workspace, while a{" "}
            <strong>session</strong> represents a specific branch within that
            codespace. Each branch has its own session with independent file
            state.
          </p>
        </InfoBox>
      </section>

      <section className="my-8">
        <h2 className={`text-2xl font-bold ${theme.text} mb-4`}>
          Step-by-Step Guide
        </h2>

        <div className="space-y-6">
          <div
            className={`${theme.surface} ${theme.border} border rounded-lg p-5`}
          >
            <h3 className={`text-lg font-semibold ${theme.text} mb-3`}>
              1. Navigate to Dashboard
            </h3>
            <p className={theme.textSecondary}>
              After logging in, you'll be automatically redirected to your
              dashboard at <code className="font-mono text-sm">/dashboard</code>
            </p>
          </div>

          <div
            className={`${theme.surface} ${theme.border} border rounded-lg p-5`}
          >
            <h3 className={`text-lg font-semibold ${theme.text} mb-3`}>
              2. Click "Create New Codespace"
            </h3>
            <p className={theme.textSecondary}>
              Look for the card with a <strong>+ icon</strong> labeled "Create
              New Codespace" and click it.
            </p>
          </div>

          <div
            className={`${theme.surface} ${theme.border} border rounded-lg p-5`}
          >
            <h3 className={`text-lg font-semibold ${theme.text} mb-3`}>
              3. Fill in Codespace Details
            </h3>
            <div className={`space-y-3 ${theme.textSecondary}`}>
              <div>
                <p className="font-semibold mb-1">
                  Name <span className="text-red-500">*</span>
                </p>
                <p className="text-sm">
                  A descriptive name for your project (e.g., "React Dashboard",
                  "Python ML Project")
                </p>
              </div>
              <div>
                <p className="font-semibold mb-1">Description</p>
                <p className="text-sm">
                  Optional description to help identify the project's purpose
                </p>
              </div>
              <div>
                <p className="font-semibold mb-1">Primary Language</p>
                <p className="text-sm">
                  Select the main programming language you'll be using
                </p>
              </div>
            </div>
          </div>

          <div
            className={`${theme.surface} ${theme.border} border rounded-lg p-5`}
          >
            <h3 className={`text-lg font-semibold ${theme.text} mb-3`}>
              4. Create and Open
            </h3>
            <p className={theme.textSecondary}>
              Click the <strong>Create</strong> button. Your codespace will be
              created with a default "main" branch, and you'll be redirected to
              the editor.
            </p>
          </div>
        </div>
      </section>

      <section className="my-8">
        <h2 className={`text-2xl font-bold ${theme.text} mb-4`}>
          Understanding the Editor Interface
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className={`${theme.surfaceSecondary} p-4 rounded-lg`}>
            <h3 className={`font-semibold ${theme.text} mb-2`}>
              📁 Left Panel
            </h3>
            <p className={`text-sm ${theme.textSecondary}`}>
              File Explorer - Create, rename, and organize your project files
              and folders
            </p>
          </div>

          <div className={`${theme.surfaceSecondary} p-4 rounded-lg`}>
            <h3 className={`font-semibold ${theme.text} mb-2`}>
              💻 Center Panel
            </h3>
            <p className={`text-sm ${theme.textSecondary}`}>
              Monaco Editor - Write your code with syntax highlighting and
              IntelliSense
            </p>
          </div>

          <div className={`${theme.surfaceSecondary} p-4 rounded-lg`}>
            <h3 className={`font-semibold ${theme.text} mb-2`}>
              🔧 Right Panels
            </h3>
            <p className={`text-sm ${theme.textSecondary}`}>
              Git, Chat, AI Assistant, and Compiler - Access tools and
              collaborate
            </p>
          </div>
        </div>
      </section>

      <section className="my-8">
        <h2 className={`text-2xl font-bold ${theme.text} mb-4`}>
          Creating Your First File
        </h2>

        <p className={`${theme.textSecondary} mb-4`}>
          Let's create a simple "Hello World" program:
        </p>

        <div className="space-y-4">
          <div>
            <p className={`${theme.textSecondary} mb-2`}>
              <strong className={theme.text}>1.</strong> In the file explorer,
              click the <strong>+</strong> icon
            </p>
            <p className={`${theme.textSecondary} mb-2`}>
              <strong className={theme.text}>2.</strong> Select "New File"
            </p>
            <p className={`${theme.textSecondary} mb-2`}>
              <strong className={theme.text}>3.</strong> Name it{" "}
              <code className="font-mono text-sm">hello.js</code>
            </p>
            <p className={`${theme.textSecondary} mb-2`}>
              <strong className={theme.text}>4.</strong> Type the following
              code:
            </p>
          </div>

          <CodeBlock
            filename="hello.js"
            language="javascript"
            code={`// Welcome to your first codespace!
console.log("Hello, RTC Editor!");

const greeting = (name) => {
  return \`Welcome, \${name}! Happy coding!\`;
};

console.log(greeting("Developer"));`}
          />

          <InfoBox type="success">
            <p>
              Your file is automatically saved as you type. No need to press
              Ctrl+S (though the shortcut still works)!
            </p>
          </InfoBox>
        </div>
      </section>

      <section className="my-8">
        <h2 className={`text-2xl font-bold ${theme.text} mb-4`}>
          Making Your First Commit
        </h2>

        <p className={`${theme.textSecondary} mb-4`}>
          Now let's save a snapshot of your work:
        </p>

        <ol
          className={`list-decimal list-inside space-y-2 ${theme.textSecondary}`}
        >
          <li>
            Open the <strong className={theme.text}>Git Panel</strong> from the
            right sidebar (look for the branch icon)
          </li>
          <li>
            In the commit message field, type something like{" "}
            <code className="font-mono text-sm">
              "Initial commit: Add hello.js"
            </code>
          </li>
          <li>
            Click the <strong className={theme.text}>Commit</strong> button
          </li>
          <li>Wait for the success notification</li>
        </ol>

        <InfoBox type="info" title="Why Commit?">
          <p>
            Commits create checkpoints in your project's history. You can always
            rollback to any previous commit if you need to undo changes or
            compare different versions of your code.
          </p>
        </InfoBox>
      </section>

      <section className="my-8">
        <h2 className={`text-2xl font-bold ${theme.text} mb-4`}>
          Inviting a Collaborator
        </h2>

        <p className={`${theme.textSecondary} mb-4`}>To start collaborating:</p>

        <ol
          className={`list-decimal list-inside space-y-2 ${theme.textSecondary}`}
        >
          <li>
            Click the <strong className={theme.text}>Settings</strong> or{" "}
            <strong>Share</strong> button in the navigation bar
          </li>
          <li>Enter your teammate's email address</li>
          <li>
            Select their role:
            <ul className="list-disc list-inside ml-6 mt-1">
              <li>
                <strong className={theme.text}>Admin</strong> - Full control of
                the codespace
              </li>
              <li>
                <strong className={theme.text}>Developer</strong> - Can edit and
                commit
              </li>
              <li>
                <strong className={theme.text}>Learner</strong> - View-only
                access
              </li>
            </ul>
          </li>
          <li>
            Click <strong className={theme.text}>Send Invitation</strong>
          </li>
        </ol>

        <InfoBox type="success">
          <p>
            Once they accept, you'll see their avatar in the top-right corner
            and their cursor will appear in the editor as they type!
          </p>
        </InfoBox>
      </section>

      <section className="my-8">
        <h2 className={`text-2xl font-bold ${theme.text} mb-4`}>
          Best Practices
        </h2>

        <div className="space-y-3">
          <div
            className={`${theme.surfaceSecondary} ${theme.border} border-l-4 border-blue-500 p-4 rounded-r-lg`}
          >
            <h3 className={`font-semibold ${theme.text} mb-2`}>
              💡 Organize Your Files
            </h3>
            <p className={`text-sm ${theme.textSecondary}`}>
              Create folders to organize your code:{" "}
              <code className="font-mono text-xs">src/</code>,{" "}
              <code className="font-mono text-xs">tests/</code>,
              <code className="font-mono text-xs">docs/</code>, etc.
            </p>
          </div>

          <div
            className={`${theme.surfaceSecondary} ${theme.border} border-l-4 border-green-500 p-4 rounded-r-lg`}
          >
            <h3 className={`font-semibold ${theme.text} mb-2`}>
              🔄 Commit Regularly
            </h3>
            <p className={`text-sm ${theme.textSecondary}`}>
              Make small, frequent commits with descriptive messages. This makes
              it easier to track changes and rollback if needed.
            </p>
          </div>

          <div
            className={`${theme.surfaceSecondary} ${theme.border} border-l-4 border-purple-500 p-4 rounded-r-lg`}
          >
            <h3 className={`font-semibold ${theme.text} mb-2`}>
              💬 Use the Chat
            </h3>
            <p className={`text-sm ${theme.textSecondary}`}>
              Keep your team in sync by using the integrated chat to discuss
              changes and coordinate work.
            </p>
          </div>
        </div>
      </section>

      <section className="my-8">
        <h2 className={`text-2xl font-bold ${theme.text} mb-4`}>Next Steps</h2>

        <div className="flex flex-col gap-3">
          <Link
            to="/docs/getting-started/basic-concepts"
            className={`${theme.surface} ${theme.border} border ${theme.hover} p-4 rounded-lg flex items-center justify-between`}
          >
            <div>
              <h3 className={`font-semibold ${theme.text}`}>Basic Concepts</h3>
              <p className={`text-sm ${theme.textSecondary}`}>
                Understand codespaces, sessions, and branches
              </p>
            </div>
            <span className={theme.text}>→</span>
          </Link>

          <Link
            to="/docs/features/real-time-collaboration"
            className={`${theme.surface} ${theme.border} border ${theme.hover} p-4 rounded-lg flex items-center justify-between`}
          >
            <div>
              <h3 className={`font-semibold ${theme.text}`}>
                Real-time Collaboration
              </h3>
              <p className={`text-sm ${theme.textSecondary}`}>
                Learn about live editing features
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
                Master branches and commits
              </p>
            </div>
            <span className={theme.text}>→</span>
          </Link>
        </div>
      </section>
    </div>
  );
}
