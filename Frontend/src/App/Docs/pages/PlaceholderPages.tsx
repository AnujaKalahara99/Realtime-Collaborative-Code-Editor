// Placeholder component generator
import { useTheme } from "../../../Contexts/ThemeProvider";
import Breadcrumb from "../components/Breadcrumb";

interface PlaceholderPageProps {
  title: string;
  breadcrumbs: Array<{ label: string; path?: string }>;
  description: string;
}

export default function PlaceholderPage({
  title,
  breadcrumbs,
  description,
}: PlaceholderPageProps) {
  const { theme } = useTheme();

  return (
    <div className="max-w-4xl">
      <Breadcrumb items={breadcrumbs} />
      <h1 className={`text-4xl font-bold ${theme.text} mb-4`}>{title}</h1>
      <p className={`text-lg ${theme.textSecondary} mb-8`}>{description}</p>
      <div className={`${theme.surfaceSecondary} p-8 rounded-lg text-center`}>
        <p className={theme.textSecondary}>📝 Content coming soon...</p>
      </div>
    </div>
  );
}

// Features pages
export function RealTimeCollaboration() {
  return (
    <PlaceholderPage
      title="Real-time Collaboration"
      breadcrumbs={[
        { label: "Documentation", path: "/docs" },
        { label: "Features", path: "/docs/features/real-time-collaboration" },
        { label: "Real-time Collaboration" },
      ]}
      description="Experience Google Docs-style collaboration for code with live cursors and automatic synchronization."
    />
  );
}

export function CodeEditorFeature() {
  return (
    <PlaceholderPage
      title="Code Editor"
      breadcrumbs={[
        { label: "Documentation", path: "/docs" },
        { label: "Features", path: "/docs/features/code-editor" },
        { label: "Code Editor" },
      ]}
      description="Monaco Editor integration with syntax highlighting, IntelliSense, and multi-language support."
    />
  );
}

export function VersionControl() {
  return (
    <PlaceholderPage
      title="Version Control"
      breadcrumbs={[
        { label: "Documentation", path: "/docs" },
        { label: "Features", path: "/docs/features/version-control" },
        { label: "Version Control" },
      ]}
      description="Git-like version control with commits, branches, and rollback capabilities."
    />
  );
}

export function ProjectManagement() {
  return (
    <PlaceholderPage
      title="Project Management"
      breadcrumbs={[
        { label: "Documentation", path: "/docs" },
        { label: "Features", path: "/docs/features/project-management" },
        { label: "Project Management" },
      ]}
      description="Organize files and folders with an intuitive file explorer."
    />
  );
}

export function AIAssistant() {
  return (
    <PlaceholderPage
      title="AI Assistant"
      breadcrumbs={[
        { label: "Documentation", path: "/docs" },
        { label: "Features", path: "/docs/features/ai-assistant" },
        { label: "AI Assistant" },
      ]}
      description="Get code suggestions and explanations from an integrated AI assistant."
    />
  );
}

export function LiveChat() {
  return (
    <PlaceholderPage
      title="Live Chat"
      breadcrumbs={[
        { label: "Documentation", path: "/docs" },
        { label: "Features", path: "/docs/features/live-chat" },
        { label: "Live Chat" },
      ]}
      description="Communicate with your team in real-time without leaving the editor."
    />
  );
}

// User Guides pages
export function ManagingCodespaces() {
  return (
    <PlaceholderPage
      title="Managing Codespaces"
      breadcrumbs={[
        { label: "Documentation", path: "/docs" },
        { label: "User Guides", path: "/docs/guides/managing-codespaces" },
        { label: "Managing Codespaces" },
      ]}
      description="Create, configure, and manage your collaborative workspaces."
    />
  );
}

export function CollaboratingWithTeam() {
  return (
    <PlaceholderPage
      title="Collaborating with Team"
      breadcrumbs={[
        { label: "Documentation", path: "/docs" },
        { label: "User Guides", path: "/docs/guides/collaborating-with-team" },
        { label: "Collaborating with Team" },
      ]}
      description="Best practices for effective team collaboration in RTC Editor."
    />
  );
}

export function UsingGitFeatures() {
  return (
    <PlaceholderPage
      title="Using Git Features"
      breadcrumbs={[
        { label: "Documentation", path: "/docs" },
        { label: "User Guides", path: "/docs/guides/using-git-features" },
        { label: "Using Git Features" },
      ]}
      description="Master version control with commits, branches, and rollbacks."
    />
  );
}

export function WorkingWithFiles() {
  return (
    <PlaceholderPage
      title="Working with Files"
      breadcrumbs={[
        { label: "Documentation", path: "/docs" },
        { label: "User Guides", path: "/docs/guides/working-with-files" },
        { label: "Working with Files" },
      ]}
      description="Create, edit, and organize your project files efficiently."
    />
  );
}

export function RoleBasedAccess() {
  return (
    <PlaceholderPage
      title="Role-based Access Control"
      breadcrumbs={[
        { label: "Documentation", path: "/docs" },
        { label: "User Guides", path: "/docs/guides/role-based-access" },
        { label: "Role-based Access" },
      ]}
      description="Understand and manage user roles and permissions in your codespaces."
    />
  );
}

// Advanced Topics pages
export function ArchitectureOverview() {
  return (
    <PlaceholderPage
      title="Architecture Overview"
      breadcrumbs={[
        { label: "Documentation", path: "/docs" },
        { label: "Advanced Topics", path: "/docs/advanced/architecture" },
        { label: "Architecture" },
      ]}
      description="Understand the microservices architecture powering RTC Editor."
    />
  );
}

export function RealTimeSync() {
  return (
    <PlaceholderPage
      title="Real-time Synchronization"
      breadcrumbs={[
        { label: "Documentation", path: "/docs" },
        { label: "Advanced Topics", path: "/docs/advanced/real-time-sync" },
        { label: "Real-time Sync" },
      ]}
      description="Deep dive into Yjs CRDTs and WebSocket synchronization."
    />
  );
}

export function VirtualFileSystem() {
  return (
    <PlaceholderPage
      title="Virtual File System"
      breadcrumbs={[
        { label: "Documentation", path: "/docs" },
        {
          label: "Advanced Topics",
          path: "/docs/advanced/virtual-file-system",
        },
        { label: "Virtual File System" },
      ]}
      description="How RTC Editor manages files in-browser without a traditional file system."
    />
  );
}

export function InBrowserBundling() {
  return (
    <PlaceholderPage
      title="In-browser Bundling"
      breadcrumbs={[
        { label: "Documentation", path: "/docs" },
        {
          label: "Advanced Topics",
          path: "/docs/advanced/in-browser-bundling",
        },
        { label: "In-browser Bundling" },
      ]}
      description="Learn how esbuild-wasm enables code bundling directly in the browser."
    />
  );
}
