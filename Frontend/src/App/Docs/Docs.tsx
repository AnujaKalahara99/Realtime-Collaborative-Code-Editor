import { Routes, Route, Navigate } from "react-router";
import DocsLayout from "./DocsLayout";

import Introduction from "./pages/GettingStarted/Introduction";
import QuickStart from "./pages/GettingStarted/QuickStart";
import Installation from "./pages/GettingStarted/Installation";
import FirstCodespace from "./pages/GettingStarted/FirstCodespace";
import BasicConcepts from "./pages/GettingStarted/BasicConcepts";
import {
  RealTimeCollaboration,
  CodeEditorFeature,
  VersionControl,
  ProjectManagement,
  AIAssistant,
  LiveChat,
  ManagingCodespaces,
  CollaboratingWithTeam,
  UsingGitFeatures,
  WorkingWithFiles,
  RoleBasedAccess,
  ArchitectureOverview,
  RealTimeSync,
  VirtualFileSystem,
  InBrowserBundling,
} from "./pages/PlaceholderPages";

export default function Docs() {
  return (
    <DocsLayout>
      <Routes>
        <Route
          path="/"
          element={<Navigate to="/docs/getting-started/introduction" replace />}
        />

        {/* Getting Started */}
        <Route
          path="/getting-started/introduction"
          element={<Introduction />}
        />
        <Route path="/getting-started/quick-start" element={<QuickStart />} />
        <Route
          path="/getting-started/installation"
          element={<Installation />}
        />
        <Route
          path="/getting-started/first-codespace"
          element={<FirstCodespace />}
        />
        <Route
          path="/getting-started/basic-concepts"
          element={<BasicConcepts />}
        />

        {/* Features */}
        <Route
          path="/features/real-time-collaboration"
          element={<RealTimeCollaboration />}
        />
        <Route path="/features/code-editor" element={<CodeEditorFeature />} />
        <Route path="/features/version-control" element={<VersionControl />} />
        <Route
          path="/features/project-management"
          element={<ProjectManagement />}
        />
        <Route path="/features/ai-assistant" element={<AIAssistant />} />
        <Route path="/features/live-chat" element={<LiveChat />} />

        {/* User Guides */}
        <Route
          path="/guides/managing-codespaces"
          element={<ManagingCodespaces />}
        />
        <Route
          path="/guides/collaborating-with-team"
          element={<CollaboratingWithTeam />}
        />
        <Route
          path="/guides/using-git-features"
          element={<UsingGitFeatures />}
        />
        <Route
          path="/guides/working-with-files"
          element={<WorkingWithFiles />}
        />
        <Route path="/guides/role-based-access" element={<RoleBasedAccess />} />

        {/* Advanced Topics */}
        <Route
          path="/advanced/architecture"
          element={<ArchitectureOverview />}
        />
        <Route path="/advanced/real-time-sync" element={<RealTimeSync />} />
        <Route
          path="/advanced/virtual-file-system"
          element={<VirtualFileSystem />}
        />
        <Route
          path="/advanced/in-browser-bundling"
          element={<InBrowserBundling />}
        />
      </Routes>
    </DocsLayout>
  );
}
