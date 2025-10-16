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
      <div className={`${theme.surfaceSecondary} p-8 rounded-lg text-left`}>
        {title === "Real-time Collaboration" && (
          <div>
            <p className={theme.textSecondary}>
              Collaborate with your team in real-time. See live cursors, edits, and
              comments as they happen. Perfect for pair programming and team
              projects.
            </p>
            <ul className={`list-disc list-inside space-y-2 ${theme.textSecondary}`}>
              <li>Live cursors allow you to see where your teammates are editing in real-time.</li>
              <li>Instant synchronization ensures all changes are reflected across all collaborators.</li>
              <li>Commenting feature enables contextual discussions directly within the code.</li>
            </ul>
          </div>
        )}
        {title === "Code Editor" && (
          <div>
            <p className={theme.textSecondary}>
              Enjoy a powerful code editor with Monaco integration, offering syntax
              highlighting, IntelliSense, and support for multiple programming
              languages.
            </p>
            <ul className={`list-disc list-inside space-y-2 ${theme.textSecondary}`}>
              <li>Advanced syntax highlighting for over 20 programming languages.</li>
              <li>IntelliSense provides smart code completions and inline documentation.</li>
              <li>Customizable themes and layouts to suit your preferences.</li>
            </ul>
          </div>
        )}
        {title === "Version Control" && (
          <div>
            <p className={theme.textSecondary}>
              Manage your code versions seamlessly with Git-like features. Create
              commits, branches, and rollbacks to keep your project history intact.
            </p>
            <ul className={`list-disc list-inside space-y-2 ${theme.textSecondary}`}>
              <li>Create and manage branches to work on features independently.</li>
              <li>Rollback changes to previous commits with ease.</li>
              <li>View detailed commit history to track project progress.</li>
            </ul>
          </div>
        )}
        {title === "Project Management" && (
          <div>
            <p className={theme.textSecondary}>
              Organize your project files and folders effortlessly with an
              intuitive file explorer. Stay on top of your tasks and deadlines.
            </p>
            <ul className={`list-disc list-inside space-y-2 ${theme.textSecondary}`}>
              <li>Drag-and-drop functionality for easy file organization.</li>
              <li>Integrated task management to track deadlines and milestones.</li>
              <li>Search and filter options to quickly locate files.</li>
            </ul>
          </div>
        )}
        {title === "AI Assistant" && (
          <div>
            <p className={theme.textSecondary}>
              Leverage the power of AI to get code suggestions, explanations, and
              debugging assistance directly within your editor.
            </p>
            <ul className={`list-disc list-inside space-y-2 ${theme.textSecondary}`}>
              <li>Receive context-aware code suggestions to speed up development.</li>
              <li>Get detailed explanations for complex code snippets.</li>
              <li>Debug your code with AI-powered insights and recommendations.</li>
            </ul>
          </div>
        )}
        {title === "Live Chat" && (
          <div>
            <p className={theme.textSecondary}>
              Communicate with your team in real-time using the integrated chat
              feature. Share ideas, discuss code, and resolve issues instantly.
            </p>
            <ul className={`list-disc list-inside space-y-2 ${theme.textSecondary}`}>
              <li>Instant messaging for quick communication.</li>
              <li>Share code snippets and files directly in the chat.</li>
              <li>Keep a history of discussions for future reference.</li>
            </ul>
          </div>
        )}
        {title === "Managing Codespaces" && (
          <div>
            <p className={theme.textSecondary}>
              Learn how to create, configure, and manage collaborative workspaces
              tailored to your team’s needs. Codespaces provide isolated
              environments for development, ensuring that your projects remain
              secure and organized. With easy setup and configuration options,
              you can get started quickly and focus on coding.
            </p>
            <div className="mt-4">
              <h3 className={`text-xl font-bold ${theme.text} mb-2`}>Features:</h3>
              <ul className={`list-disc list-inside space-y-2 ${theme.textSecondary}`}>
                <li>
                  Users can create a new codespace by clicking the{" "}
                  <strong className="text-blue-500">+ icon</strong>.
                </li>
                <li>
                  From the{" "}
                  <strong className="text-blue-500">settings button</strong>, users
                  can:
                  <ul className="list-disc list-inside ml-6">
                    <li>Edit the codespace.</li>
                    <li>Share the codespace with others.</li>
                    <li>Delete the codespace.</li>
                  </ul>
                </li>
              </ul>
              <div className="mt-4">
                <img
                  src="/codespaceedit.png"
                  alt="Codespaces Dashboard Screenshot"
                  className="rounded shadow-md"
                />
              </div>
            </div>
          </div>
        )}
        {title === "Collaborating with Team" && (
          <div>
            <p className={theme.textSecondary}>
              Discover best practices for effective team collaboration, ensuring
              smooth workflows and productive coding sessions.
            </p>
            <div className="mt-4">
              <p className={theme.textSecondary}>
                Users can share codespaces with team members and remove users from
                codespaces seamlessly, ensuring a smooth and collaborative workflow.
              </p>
            </div>
            <div className="mt-4">
 
              <img
                src="/colloborate2.png"
                alt="Collaborating with Team Screenshot"
                className="rounded shadow-md"
              />
            </div>
            <div className="mt-4">
              <ul className={`list-disc list-inside space-y-2 ${theme.textSecondary}`}>
                <li>Users can share messages within the codespace for seamless communication.</li>
                <li>Collaborators can edit the same codespace file simultaneously.</li>
                <li>Compile code and leverage auto AI suggestions for enhanced productivity.</li>
                <li>Utilize the RTC chatbot for real-time assistance and collaboration.</li>
              </ul>
            </div>
          </div>
        )}
        {title === "Using Git Features" && (
          <div>
            <p className={theme.textSecondary}>
              Master Git features like commits, branches, and rollbacks to maintain
              a clean and organized project history.
            </p>
            <div className="mt-4">
              <img
                src="/git.png"
                alt="Git Features Screenshot"
                className="rounded shadow-md"
              />
            </div>
            <div className="mt-4">
              <ul className={`list-disc list-inside space-y-2 ${theme.textSecondary}`}>
                <li>Version controlling can be done with commits and rollbacks.</li>
                <li>Integration with GitHub repositories for seamless collaboration.</li>
              </ul>
            </div>
             <div className="mt-4">
              <img
                src="/git2.png"
                alt="Git Features Screenshot"
                className="rounded shadow-md"
              />
            </div>
          </div>
        )}
        {title === "Working with Files" && (
          <div>
            <p className={theme.textSecondary}>
              Create, edit, and organize your project files efficiently with our
              user-friendly file management tools.
            </p>
            <div className="mt-4">
              <img
                src="/files.png"
                alt="File Management Screenshot"
                className="rounded shadow-md"
              />
            </div>
            <div className="mt-4">
              <ul className={`list-disc list-inside space-y-2 ${theme.textSecondary}`}>
                <li>Create folders and add files to organize your project.</li>
                <li>Edit files and folders directly within the editor.</li>
                <li>Rename files and folders for better clarity.</li>
                <li>Delete files and folders to keep your workspace clean.</li>
              </ul>
            </div>
          </div>
        )}
        {title === "Role-based Access Control" && (
          <div>
            <p className={theme.textSecondary}>
              Manage user roles and permissions effectively to ensure secure and
              organized collaboration within your codespaces.
            </p>
            <div className="mt-4">
              <img
                src="/role.png"
                alt="Role-based Access Control Screenshot"
                className="rounded shadow-md"
              />
            </div>
            <div className="mt-4">
              <ul className={`list-disc list-inside space-y-2 ${theme.textSecondary}`}>
                <li>The owner is the one who creates the codespace and has the exclusive ability to remove it.</li>
                <li>Admins can share the codespace link with collaborators.</li>
                <li>Developers can actively work on the project within the codespace.</li>
              </ul>
            </div>
          </div>
        )}
        {title === "Architecture Overview" && (
          <div>
            <p className={theme.textSecondary}>
              Dive into the microservices architecture that powers the RTC Editor, enabling scalability and reliability. The architecture is designed to support real-time collaboration, efficient file management, and seamless integration with external tools.
            </p>
            <div className="mt-4">
              <h3 className={`text-xl font-bold ${theme.text} mb-2`}>Key Components:</h3>
              <ul className={`list-disc list-inside space-y-2 ${theme.textSecondary}`}>
                <li>
                  <strong>API Gateway:</strong> Acts as the entry point for all client requests, routing them to the appropriate microservices.
                </li>
                <li>
                  <strong>WebSocket Server:</strong> Handles real-time communication, ensuring low-latency updates for collaborative features.
                </li>
                <li>
                  <strong>Codespace Service:</strong> Manages the lifecycle of codespaces, including creation, configuration, and deletion.
                </li>
                <li>
                  <strong>Compiler Engine:</strong> Executes code in isolated environments, supporting multiple programming languages.
                </li>
                <li>
                  <strong>Version Control Service:</strong> Provides Git-like features for versioning and collaboration.
                </li>
                <li>
                  <strong>Frontend:</strong> A React-based user interface that integrates all features into a cohesive experience.
                </li>
              </ul>
            </div>
            <div className="mt-4">
              <h3 className={`text-xl font-bold ${theme.text} mb-2`}>Scalability and Reliability:</h3>
              <p className={theme.textSecondary}>
                The architecture leverages containerization and orchestration tools like Docker and Kubernetes to ensure scalability. Each microservice can be independently scaled based on demand, and fault tolerance is achieved through redundancy and health checks.
              </p>
            </div>
            <div className="mt-4">
              <img
                src="/architecture.png"
                alt="Architecture Diagram"
                className="rounded shadow-md"
              />
            </div>
          </div>
        )}
        {title === "Real-time Synchronization" && (
          <div>
            <p className={theme.textSecondary}>
              Explore the underlying technologies that make real-time collaboration possible in the RTC Editor. This section delves into the mechanisms ensuring seamless synchronization across users.
            </p>
            <div className="mt-4">
              <h3 className={`text-xl font-bold ${theme.text} mb-2`}>Key Technologies:</h3>
              <ul className={`list-disc list-inside space-y-2 ${theme.textSecondary}`}>
                <li>
                  <strong>Yjs CRDTs:</strong> A conflict-free replicated data type (CRDT) library that ensures consistent data synchronization across multiple users, even in the presence of network partitions.
                </li>
                <li>
                  <strong>WebSocket Synchronization:</strong> Enables low-latency, bidirectional communication between the client and server, ensuring real-time updates.
                </li>
                <li>
                  <strong>Operational Transformation:</strong> Handles concurrent edits by transforming operations to maintain consistency.
                </li>
              </ul>
            </div>
            <div className="mt-4">
              <h3 className={`text-xl font-bold ${theme.text} mb-2`}>How It Works:</h3>
              <p className={theme.textSecondary}>
                When a user makes an edit, the change is captured as an operation and broadcast to other users via WebSockets. Yjs CRDTs ensure that all users converge to the same state, regardless of the order in which operations are applied.
              </p>
            </div>
            <div className="mt-4">
              <h3 className={`text-xl font-bold ${theme.text} mb-2`}>Benefits:</h3>
              <ul className={`list-disc list-inside space-y-2 ${theme.textSecondary}`}>
                <li>Ensures data consistency across all collaborators.</li>
                <li>Handles network disruptions gracefully, syncing changes once connectivity is restored.</li>
                <li>Provides a seamless and responsive user experience.</li>
              </ul>
            </div>
            <div className="mt-4">
              {/* <img
                src="/realtime-sync-diagram.png"
                alt="Real-time Synchronization Diagram"
                className="rounded shadow-md"
              /> */}
            </div>
          </div>
        )}
        {title === "Virtual File System" && (
          <div>
            <p className={theme.textSecondary}>
              The Virtual File System (VFS) in the RTC Editor is designed to manage files directly in the browser, eliminating the need for a traditional file system. This approach ensures fast, secure, and efficient file operations tailored for real-time collaboration.
            </p>
            <div className="mt-4">
              <h3 className={`text-xl font-bold ${theme.text} mb-2`}>Key Features:</h3>
              <ul className={`list-disc list-inside space-y-2 ${theme.textSecondary}`}>
                <li>
                  <strong>In-memory File Management:</strong> Files are stored in memory, allowing for instant access and modifications without disk I/O delays.
                </li>
                <li>
                  <strong>Sandboxed Environment:</strong> Ensures that file operations are isolated and secure, preventing unauthorized access.
                </li>
                <li>
                  <strong>Integration with Real-time Collaboration:</strong> Changes to files are synchronized across all collaborators in real-time.
                </li>
              </ul>
            </div>
            <div className="mt-4">
              <h3 className={`text-xl font-bold ${theme.text} mb-2`}>How It Works:</h3>
              <p className={theme.textSecondary}>
                The VFS leverages in-browser storage mechanisms like IndexedDB and Web Storage for persistence. When a user creates or modifies a file, the changes are reflected in the VFS and synchronized with the server. The server acts as a central hub, ensuring consistency across all collaborators.
              </p>
            </div>
            <div className="mt-4">
              <h3 className={`text-xl font-bold ${theme.text} mb-2`}>Benefits:</h3>
              <ul className={`list-disc list-inside space-y-2 ${theme.textSecondary}`}>
                <li>Eliminates dependency on local file systems, making the editor platform-independent.</li>
                <li>Enables seamless collaboration with real-time file updates.</li>
                <li>Provides a secure and isolated environment for file operations.</li>
              </ul>
            </div>
            <div className="mt-4">
              {/* <img
                src="/virtual-file-system-diagram.png"
                alt="Virtual File System Diagram"
                className="rounded shadow-md"
              /> */}
            </div>
          </div>
        )}
        {title === "In-browser Bundling" && (
          <div>
            <p className={theme.textSecondary}>
              In-browser bundling in the RTC Editor leverages the power of esbuild-wasm to enable fast and efficient code bundling directly within the browser. This eliminates the need for server-side bundling, providing a seamless and responsive development experience.
            </p>
            <div className="mt-4">
              <h3 className={`text-xl font-bold ${theme.text} mb-2`}>Key Features:</h3>
              <ul className={`list-disc list-inside space-y-2 ${theme.textSecondary}`}>
                <li>
                  <strong>High Performance:</strong> esbuild-wasm is optimized for speed, bundling code significantly faster than traditional tools.
                </li>
                <li>
                  <strong>Lightweight:</strong> Runs entirely in the browser, reducing the need for heavy server-side infrastructure.
                </li>
                <li>
                  <strong>Multi-language Support:</strong> Supports JavaScript, TypeScript, and other modern web languages.
                </li>
              </ul>
            </div>
            <div className="mt-4">
              <h3 className={`text-xl font-bold ${theme.text} mb-2`}>How It Works:</h3>
              <p className={theme.textSecondary}>
                The bundling process begins when the user writes or modifies code in the editor. esbuild-wasm compiles and bundles the code in real-time, ensuring that all dependencies are resolved and optimized for execution. The bundled output is then immediately available for preview or further processing.
              </p>
            </div>
            <div className="mt-4">
              <h3 className={`text-xl font-bold ${theme.text} mb-2`}>Benefits:</h3>
              <ul className={`list-disc list-inside space-y-2 ${theme.textSecondary}`}>
                <li>Provides instant feedback during development, enhancing productivity.</li>
                <li>Reduces latency by eliminating server-side bundling.</li>
                <li>Ensures compatibility with modern web standards.</li>
              </ul>
            </div>
            <div className="mt-4">
              {/* <img
                src="/in-browser-bundling-diagram.png"
                alt="In-browser Bundling Diagram"
                className="rounded shadow-md"
              /> */}
            </div>
          </div>
        )}
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
