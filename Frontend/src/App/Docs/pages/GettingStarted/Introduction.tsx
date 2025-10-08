import { useTheme } from "../../../../Contexts/ThemeProvider";
import { Link } from "react-router";
import Breadcrumb from "../../components/Breadcrumb";
import InfoBox from "../../components/InfoBox";
import {
  Code,
  Users,
  GitBranch,
  MessageSquare,
  Sparkles,
  FileCode,
} from "lucide-react";

export default function Introduction() {
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
          { label: "Introduction" },
        ]}
      />

      <h1 className={`text-4xl font-bold ${theme.text} mb-4`}>
        Welcome to RTC Editor
      </h1>

      <p className={`text-lg ${theme.textSecondary} mb-8`}>
        A powerful real-time collaborative code editor built for modern
        development teams.
      </p>

      <InfoBox type="info" title="What is RTC Editor?">
        <p>
          RTC Editor is a web-based platform that enables simultaneous
          multi-user code editing with integrated version control, testing
          capabilities, and role-based access management. Think of it as Google
          Docs for code, but with Git-like version control and a complete
          development environment.
        </p>
      </InfoBox>

      <section className="my-8">
        <h2 className={`text-2xl font-bold ${theme.text} mb-4`}>
          Key Features
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FeatureCard
            icon={<Users className="w-6 h-6" />}
            title="Real-time Collaboration"
            description="Edit code simultaneously with your team. See live cursors, selections, and changes in real-time."
            link="/docs/features/real-time-collaboration"
          />

          <FeatureCard
            icon={<Code className="w-6 h-6" />}
            title="Monaco Editor"
            description="VS Code-like editing experience with syntax highlighting, IntelliSense, and multi-language support."
            link="/docs/features/code-editor"
          />

          <FeatureCard
            icon={<GitBranch className="w-6 h-6" />}
            title="Version Control"
            description="Git-like commit/rollback operations, branch management, and diff visualization built right in."
            link="/docs/features/version-control"
          />

          <FeatureCard
            icon={<MessageSquare className="w-6 h-6" />}
            title="Live Chat"
            description="Communicate with your team directly in the editor with integrated chat functionality."
            link="/docs/features/live-chat"
          />

          <FeatureCard
            icon={<Sparkles className="w-6 h-6" />}
            title="AI Assistant"
            description="Get code suggestions, explanations, and help from an integrated AI assistant."
            link="/docs/features/ai-assistant"
          />

          <FeatureCard
            icon={<FileCode className="w-6 h-6" />}
            title="Project Management"
            description="Organize files, create folders, and manage your codebase with an intuitive file explorer."
            link="/docs/features/project-management"
          />
        </div>
      </section>

      <section className="my-8">
        <h2 className={`text-2xl font-bold ${theme.text} mb-4`}>Use Cases</h2>

        <div className={`space-y-4 ${theme.textSecondary}`}>
          <div className={`${theme.surfaceSecondary} p-4 rounded-lg`}>
            <h3 className={`font-semibold ${theme.text} mb-2`}>
              Educational Institutions
            </h3>
            <p>
              Conduct interactive coding sessions, enable students to
              collaborate on projects, and provide real-time feedback.
            </p>
          </div>

          <div className={`${theme.surfaceSecondary} p-4 rounded-lg`}>
            <h3 className={`font-semibold ${theme.text} mb-2`}>
              Development Teams
            </h3>
            <p>
              Pair programming, code reviews, and collaborative problem-solving
              with your distributed team.
            </p>
          </div>

          <div className={`${theme.surfaceSecondary} p-4 rounded-lg`}>
            <h3 className={`font-semibold ${theme.text} mb-2`}>
              Coding Bootcamps
            </h3>
            <p>
              Run training programs with live coding demonstrations and hands-on
              exercises.
            </p>
          </div>

          <div className={`${theme.surfaceSecondary} p-4 rounded-lg`}>
            <h3 className={`font-semibold ${theme.text} mb-2`}>Remote Teams</h3>
            <p>
              Collaborate effectively across time zones with persistent
              workspaces and asynchronous editing.
            </p>
          </div>
        </div>
      </section>

      <section className="my-8">
        <h2 className={`text-2xl font-bold ${theme.text} mb-4`}>
          Technology Stack
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className={`${theme.surfaceSecondary} p-4 rounded-lg`}>
            <h3 className={`font-semibold ${theme.text} mb-2`}>Frontend</h3>
            <ul
              className={`list-disc list-inside space-y-1 ${theme.textSecondary}`}
            >
              <li>React 19 & TypeScript</li>
              <li>Monaco Editor (VS Code engine)</li>
              <li>Yjs (CRDT for collaboration)</li>
              <li>TailwindCSS</li>
            </ul>
          </div>

          <div className={`${theme.surfaceSecondary} p-4 rounded-lg`}>
            <h3 className={`font-semibold ${theme.text} mb-2`}>Backend</h3>
            <ul
              className={`list-disc list-inside space-y-1 ${theme.textSecondary}`}
            >
              <li>Node.js & Express</li>
              <li>WebSocket (real-time sync)</li>
              <li>Supabase (PostgreSQL)</li>
              <li>Redis (message queue)</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="my-8">
        <h2 className={`text-2xl font-bold ${theme.text} mb-4`}>Next Steps</h2>

        <div className="flex flex-col gap-3">
          <Link
            to="/docs/getting-started/quick-start"
            className={`${theme.surface} ${theme.border} border ${theme.hover} p-4 rounded-lg flex items-center justify-between`}
          >
            <div>
              <h3 className={`font-semibold ${theme.text}`}>
                Quick Start Guide
              </h3>
              <p className={`text-sm ${theme.textSecondary}`}>
                Get up and running in 5 minutes
              </p>
            </div>
            <span className={theme.text}>→</span>
          </Link>

          <Link
            to="/docs/getting-started/installation"
            className={`${theme.surface} ${theme.border} border ${theme.hover} p-4 rounded-lg flex items-center justify-between`}
          >
            <div>
              <h3 className={`font-semibold ${theme.text}`}>Installation</h3>
              <p className={`text-sm ${theme.textSecondary}`}>
                Set up your development environment
              </p>
            </div>
            <span className={theme.text}>→</span>
          </Link>

          <Link
            to="/docs/getting-started/first-codespace"
            className={`${theme.surface} ${theme.border} border ${theme.hover} p-4 rounded-lg flex items-center justify-between`}
          >
            <div>
              <h3 className={`font-semibold ${theme.text}`}>
                Create Your First Codespace
              </h3>
              <p className={`text-sm ${theme.textSecondary}`}>
                Learn how to create and manage workspaces
              </p>
            </div>
            <span className={theme.text}>→</span>
          </Link>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
  link,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  link: string;
}) {
  const { theme } = useTheme();

  return (
    <Link
      to={link}
      className={`${theme.surface} ${theme.border} border ${theme.hover} p-4 rounded-lg transition-all`}
    >
      <div className={`${theme.statusBar.replace("bg-", "text-")} mb-3`}>
        {icon}
      </div>
      <h3 className={`font-semibold ${theme.text} mb-2`}>{title}</h3>
      <p className={`text-sm ${theme.textSecondary}`}>{description}</p>
    </Link>
  );
}
