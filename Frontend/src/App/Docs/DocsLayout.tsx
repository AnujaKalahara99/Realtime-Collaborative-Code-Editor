import { useState } from "react";
import { Link, useLocation } from "react-router";
import { useTheme } from "../../Contexts/ThemeProvider";
import {
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  Home,
  Book,
  Zap,
  Code,
} from "lucide-react";

interface NavSection {
  title: string;
  icon: React.ReactNode;
  items: NavItem[];
}

interface NavItem {
  title: string;
  path: string;
  description?: string; // Added optional description property
}

const navigationSections: NavSection[] = [
  {
    title: "Getting Started",
    icon: <Home className="w-4 h-4" />,
    items: [
      { title: "Introduction", path: "/docs/getting-started/introduction" },
      { title: "Quick Start", path: "/docs/getting-started/quick-start" },
      { title: "Installation", path: "/docs/getting-started/installation" },
      {
        title: "First Codespace",
        path: "/docs/getting-started/first-codespace",
      },
      { title: "Basic Concepts", path: "/docs/getting-started/basic-concepts" },
    ],
  },
  {
    title: "Features",
    icon: <Zap className="w-4 h-4" />,
    items: [
      {
        title: "Real-time Collaboration",
        path: "/docs/features/real-time-collaboration",
        description:
          "Collaborate with your team in real-time, share code, and work together seamlessly.",
      },
      {
        title: "Code Editor",
        path: "/docs/features/code-editor",
        description:
          "A powerful code editor with syntax highlighting, autocompletion, and debugging tools.",
      },
      {
        title: "Version Control",
        path: "/docs/features/version-control",
        description:
          "Manage your code versions, create branches, and collaborate using Git.",
      },
      {
        title: "Project Management",
        path: "/docs/features/project-management",
        description:
          "Tools for managing projects, tracking tasks, and organizing workflows.",
      },
      {
        title: "AI Assistant",
        path: "/docs/features/ai-assistant",
        description:
          "Leverage AI for code suggestions, error detection, and productivity boosts.",
      },
      {
        title: "Live Chat",
        path: "/docs/features/live-chat",
        description:
          "Communicate with your team directly within the platform using live chat.",
      },
    ],
  },
  {
    title: "User Guides",
    icon: <Book className="w-4 h-4" />,
    items: [
      {
        title: "Managing Codespaces",
        path: "/docs/guides/managing-codespaces",
      },
      {
        title: "Collaborating with Team",
        path: "/docs/guides/collaborating-with-team",
      },
      { title: "Using Git Features", path: "/docs/guides/using-git-features" },
      { title: "Working with Files", path: "/docs/guides/working-with-files" },
      { title: "Role-based Access", path: "/docs/guides/role-based-access" },
    ],
  },
  {
    title: "Advanced Topics",
    icon: <Code className="w-4 h-4" />,
    items: [
      { title: "Architecture Overview", path: "/docs/advanced/architecture" },
      { title: "Real-time Sync", path: "/docs/advanced/real-time-sync" },
      {
        title: "Virtual File System",
        path: "/docs/advanced/virtual-file-system",
      },
      // {
      //   title: "In-browser Bundling",
      //   path: "/docs/advanced/in-browser-bundling",
      // },
    ],
  },
];

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { theme } = useTheme();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<string[]>(
    navigationSections.map((section) => section.title)
  );

  const toggleSection = (title: string) => {
    setExpandedSections((prev) =>
      prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title]
    );
  };

  return (
    <div className={`min-h-screen ${theme.background}`}>
      {/* Header */}
      <header
        className={`${theme.surface} ${theme.border} border-b sticky top-0 z-50`}
      >
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className={`lg:hidden ${theme.text} ${theme.hover} p-2 rounded-md`}
            >
              {sidebarOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
            <Link to="/" className="flex items-center gap-2">
              <Code
                className={`w-6 h-6 ${theme.statusBar.replace("bg-", "text-")}`}
              />
              <span className={`text-xl font-bold ${theme.text}`}>
                RTC Editor
              </span>
            </Link>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link
              to="/"
              className={`${theme.textSecondary} ${theme.hover} px-3 py-2 rounded-md`}
            >
              Home
            </Link>
            <Link
              to="/dashboard"
              className={`${theme.textSecondary} ${theme.hover} px-3 py-2 rounded-md`}
            >
              Dashboard
            </Link>
            <Link
              to="/docs"
              className={`${theme.text} ${theme.hover} px-3 py-2 rounded-md`}
            >
              Documentation
            </Link>
            <a
              href="https://github.com/AnujaKalahara99/Realtime-Collaborative-Code-Editor"
              target="_blank"
              rel="noopener noreferrer"
              className={`${theme.textSecondary} ${theme.hover} px-3 py-2 rounded-md`}
            >
              GitHub
            </a>
          </nav>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 flex gap-6">
        {/* Sidebar */}
        <aside
          className={`
            ${theme.surface} ${theme.border} border rounded-lg
            fixed lg:sticky top-20 bottom-4 left-4 right-4
            lg:left-auto lg:right-auto lg:w-64
            z-40 overflow-y-auto Simple-Scrollbar 
            transition-transform duration-300
            ${
              sidebarOpen
                ? "translate-x-0"
                : "-translate-x-[calc(100%+2rem)] lg:translate-x-0"
            }
          `}
          style={{ maxHeight: "calc(100vh - 6rem)" }}
        >
          <nav className="p-4 space-y-2">
            {navigationSections.map((section) => (
              <div key={section.title} className="space-y-1">
                <button
                  onClick={() => toggleSection(section.title)}
                  className={`
                    w-full flex items-center justify-between gap-2
                    ${theme.text} ${theme.hover} px-3 py-2 rounded-md
                    font-semibold text-sm
                  `}
                >
                  <span className="flex items-center gap-2">
                    {section.icon}
                    {section.title}
                  </span>
                  {expandedSections.includes(section.title) ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </button>
                {expandedSections.includes(section.title) && (
                  <div className="ml-6 space-y-1">
                    {section.items.map((item) => {
                      const isActive = location.pathname === item.path;
                      return (
                        <Link
                          key={item.path}
                          to={item.path}
                          onClick={() => setSidebarOpen(false)}
                          className={`
                            block px-3 py-2 rounded-md text-sm
                            ${
                              isActive
                                ? `${theme.active} ${theme.text} font-medium`
                                : `${theme.textSecondary} ${theme.hover}`
                            }
                          `}
                        >
                          {item.title}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          <div
            className={`${theme.surface} ${theme.border} border rounded-lg p-6 lg:p-8`}
          >
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
