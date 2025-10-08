import { useTheme } from "../../../../Contexts/ThemeProvider";
import { Link } from "react-router";
import Breadcrumb from "../../components/Breadcrumb";
import InfoBox from "../../components/InfoBox";
import CodeBlock from "../../components/CodeBlock";

export default function QuickStart() {
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
          { label: "Quick Start" },
        ]}
      />

      <h1 className={`text-4xl font-bold ${theme.text} mb-4`}>
        Quick Start Guide
      </h1>

      <p className={`text-lg ${theme.textSecondary} mb-8`}>
        Get started with RTC Editor in just a few minutes.
      </p>

      <InfoBox type="success" title="Prerequisites">
        <ul className="list-disc list-inside space-y-1">
          <li>A modern web browser (Chrome, Firefox, Safari, or Edge)</li>
          <li>An email address for account creation</li>
          <li>Internet connection</li>
        </ul>
      </InfoBox>

      <section className="my-8">
        <h2 className={`text-2xl font-bold ${theme.text} mb-4`}>
          Step 1: Create an Account
        </h2>

        <div className={`space-y-3 ${theme.textSecondary}`}>
          <p>1. Navigate to the application homepage</p>
          <p>
            2. Click on <strong className={theme.text}>Sign Up</strong>
          </p>
          <p>3. Enter your email and create a password</p>
          <p>4. Verify your email address</p>
        </div>

        <InfoBox type="info">
          <p>
            You can also sign up using OAuth providers like Google or GitHub for
            faster onboarding.
          </p>
        </InfoBox>
      </section>

      <section className="my-8">
        <h2 className={`text-2xl font-bold ${theme.text} mb-4`}>
          Step 2: Create Your First Codespace
        </h2>

        <div className={`space-y-3 ${theme.textSecondary}`}>
          <p>
            1. After logging in, you'll be taken to the{" "}
            <strong className={theme.text}>Dashboard</strong>
          </p>
          <p>
            2. Click the{" "}
            <strong className={theme.text}>+ Create New Codespace</strong> card
          </p>
          <p>3. Fill in the codespace details:</p>
          <ul className="list-disc list-inside ml-6 space-y-1">
            <li>
              <strong className={theme.text}>Name:</strong> Give your workspace
              a descriptive name
            </li>
            <li>
              <strong className={theme.text}>Description:</strong> Optional
              description of the project
            </li>
            <li>
              <strong className={theme.text}>Language:</strong> Select your
              primary programming language
            </li>
          </ul>
          <p>
            4. Click <strong className={theme.text}>Create</strong>
          </p>
        </div>
      </section>

      <section className="my-8">
        <h2 className={`text-2xl font-bold ${theme.text} mb-4`}>
          Step 3: Start Coding
        </h2>

        <div className={`space-y-3 ${theme.textSecondary}`}>
          <p>
            Once your codespace is created, you'll enter the editor environment:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-4">
            <div className={`${theme.surfaceSecondary} p-4 rounded-lg`}>
              <h3 className={`font-semibold ${theme.text} mb-2`}>
                📁 File Explorer
              </h3>
              <p className="text-sm">
                On the left - create and manage your project files
              </p>
            </div>

            <div className={`${theme.surfaceSecondary} p-4 rounded-lg`}>
              <h3 className={`font-semibold ${theme.text} mb-2`}>💻 Editor</h3>
              <p className="text-sm">
                Center - write and edit your code with syntax highlighting
              </p>
            </div>

            <div className={`${theme.surfaceSecondary} p-4 rounded-lg`}>
              <h3 className={`font-semibold ${theme.text} mb-2`}>🔧 Panels</h3>
              <p className="text-sm">
                Right side - Git, AI Assistant, Chat, and Compiler panels
              </p>
            </div>
          </div>

          <p>
            <strong className={theme.text}>Create your first file:</strong>
          </p>
          <ol className="list-decimal list-inside ml-6 space-y-1">
            <li>
              Click the <strong className={theme.text}>+</strong> icon in the
              file explorer
            </li>
            <li>
              Choose <strong className={theme.text}>New File</strong>
            </li>
            <li>
              Name it (e.g., <code className="font-mono text-sm">index.js</code>
              )
            </li>
            <li>Start typing - your code is automatically saved!</li>
          </ol>
        </div>

        <CodeBlock
          language="javascript"
          filename="index.js"
          code={`// Your first file in RTC Editor!
console.log("Hello, collaborative coding!");

function greet(name) {
  return \`Welcome to RTC Editor, \${name}!\`;
}

console.log(greet("Developer"));`}
        />
      </section>

      <section className="my-8">
        <h2 className={`text-2xl font-bold ${theme.text} mb-4`}>
          Step 4: Invite Collaborators
        </h2>

        <div className={`space-y-3 ${theme.textSecondary}`}>
          <p>
            1. Click the <strong className={theme.text}>Share</strong> button in
            the navigation bar
          </p>
          <p>2. Enter your collaborator's email address</p>
          <p>3. Choose their role:</p>
          <ul className="list-disc list-inside ml-6 space-y-1">
            <li>
              <strong className={theme.text}>Admin:</strong> Full control
              (create, edit, delete, manage members)
            </li>
            <li>
              <strong className={theme.text}>Developer:</strong> Can edit code
              and commit changes
            </li>
            <li>
              <strong className={theme.text}>Learner:</strong> View-only access
              (great for students)
            </li>
          </ul>
          <p>
            4. Click <strong className={theme.text}>Send Invitation</strong>
          </p>
        </div>

        <InfoBox type="info">
          <p>
            Collaborators will receive an email with a link to join your
            codespace. Once they join, you'll see their cursor and edits in
            real-time!
          </p>
        </InfoBox>
      </section>

      <section className="my-8">
        <h2 className={`text-2xl font-bold ${theme.text} mb-4`}>
          Step 5: Use Version Control
        </h2>

        <div className={`space-y-3 ${theme.textSecondary}`}>
          <p>
            <strong className={theme.text}>Commit your changes:</strong>
          </p>
          <ol className="list-decimal list-inside ml-6 space-y-1">
            <li>
              Open the <strong className={theme.text}>Git Panel</strong> from
              the right sidebar
            </li>
            <li>Enter a commit message describing your changes</li>
            <li>
              Click <strong className={theme.text}>Commit</strong>
            </li>
          </ol>

          <p className="mt-4">
            <strong className={theme.text}>Create a branch:</strong>
          </p>
          <ol className="list-decimal list-inside ml-6 space-y-1">
            <li>Click the branch selector at the top of the Git Panel</li>
            <li>
              Click <strong className={theme.text}>New Branch</strong>
            </li>
            <li>
              Name your branch (e.g.,{" "}
              <code className="font-mono text-sm">feature/new-ui</code>)
            </li>
            <li>Start working on your feature independently!</li>
          </ol>
        </div>
      </section>

      <section className="my-8">
        <h2 className={`text-2xl font-bold ${theme.text} mb-4`}>Quick Tips</h2>

        <div className="space-y-3">
          <div
            className={`${theme.surfaceSecondary} ${theme.border} border-l-4 border-blue-500 p-4 rounded-r-lg`}
          >
            <h3 className={`font-semibold ${theme.text} mb-2`}>
              💡 Keyboard Shortcuts
            </h3>
            <ul className={`text-sm ${theme.textSecondary} space-y-1`}>
              <li>
                <code className="font-mono">Ctrl/Cmd + S</code> - Save
                (auto-saves, but available)
              </li>
              <li>
                <code className="font-mono">Ctrl/Cmd + F</code> - Find in file
              </li>
              <li>
                <code className="font-mono">Ctrl/Cmd + /</code> - Toggle comment
              </li>
            </ul>
          </div>

          <div
            className={`${theme.surfaceSecondary} ${theme.border} border-l-4 border-green-500 p-4 rounded-r-lg`}
          >
            <h3 className={`font-semibold ${theme.text} mb-2`}>⚡ Pro Tip</h3>
            <p className={`text-sm ${theme.textSecondary}`}>
              Use the AI Assistant panel to get help with your code, generate
              snippets, or ask questions about programming concepts!
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
              <h3 className={`font-semibold ${theme.text}`}>
                Learn Basic Concepts
              </h3>
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
                Explore Real-time Collaboration
              </h3>
              <p className={`text-sm ${theme.textSecondary}`}>
                Deep dive into collaborative features
              </p>
            </div>
            <span className={theme.text}>→</span>
          </Link>
        </div>
      </section>
    </div>
  );
}
