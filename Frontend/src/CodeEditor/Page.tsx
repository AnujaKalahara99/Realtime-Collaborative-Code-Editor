import React, { useState } from "react";
import { FileText, GitBranch, MessageCircle, Play } from "lucide-react";
import ProjectManagementPanel from "./ProjectManagementPanel/ProjectManagementPanel";
import GitPanel from "./GitPanel";
import LiveChatPanel from "./LiveChatPanel";
import CompilerPanel from "./CompilerPanel";
import NavigationBar from "./NavigationBar";
import StatusBar from "./StatusBar";
import MonacoEditor from "./MonacoEditor";
import { useTheme } from "../ThemeProvider";
import type { FileNode } from "./ProjectManagementPanel/commonFileTypes";

type Tab = {
  id: string;
  label: string;
  icon: React.ReactNode;
};

type TabPanelProps = {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (id: string) => void;
  children: React.ReactNode;
};

const TabPanel: React.FC<TabPanelProps> = ({
  tabs,
  activeTab,
  onTabChange,
  children,
}) => {
  const { theme } = useTheme();

  return (
    <div className="h-full flex flex-col">
      {/* Tab Headers */}
      <div
        className={`flex ${theme.surfaceSecondary} ${theme.border} border-b`}
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex items-center gap-2 px-3 py-2 text-xs font-medium ${
              theme.border
            } border-r ${theme.hover} transition-colors ${
              activeTab === tab.id
                ? `${theme.active} ${theme.text}`
                : `${theme.inactive} ${theme.textSecondary}`
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden">{children}</div>
    </div>
  );
};

// Main Editor Component
const CodeEditorPage = () => {
  const [selectedFile, setSelectedFile] = useState<FileNode | null>(null);
  const [leftActiveTab, setLeftActiveTab] = useState("pm");
  const [rightActiveTab, setRightActiveTab] = useState("chat");

  const leftTabs = [
    { id: "pm", label: "Files", icon: <FileText size={14} /> },
    { id: "git", label: "Git", icon: <GitBranch size={14} /> },
  ];

  const rightTabs = [
    { id: "chat", label: "Chat", icon: <MessageCircle size={14} /> },
    { id: "compiler", label: "Compiler", icon: <Play size={14} /> },
  ];

  const renderLeftPanel = () => {
    switch (leftActiveTab) {
      case "pm":
        return (
          <ProjectManagementPanel
            onFileSelect={(file) => setSelectedFile(file)}
          />
        );
      case "git":
        return <GitPanel />;
      default:
        return <ProjectManagementPanel />;
    }
  };

  const renderRightPanel = () => {
    switch (rightActiveTab) {
      case "chat":
        return <LiveChatPanel />;
      case "compiler":
        return <CompilerPanel />;
      default:
        return <LiveChatPanel />;
    }
  };

  return (
    <div className="h-screen bg-gray-900 flex flex-col">
      <NavigationBar />

      <div className="flex-1 flex">
        {/* Left Sidebar Panel */}
        <div className="w-80 border-r border-gray-600">
          <TabPanel
            tabs={leftTabs}
            activeTab={leftActiveTab}
            onTabChange={setLeftActiveTab}
          >
            {renderLeftPanel()}
          </TabPanel>
        </div>

        {/* Main Editor Area */}
        <div className="flex-1 flex flex-col">
          <MonacoEditor selectedFile={selectedFile} />
        </div>

        {/* Right Sidebar Panel */}
        <div className="w-80 border-l border-gray-600">
          <TabPanel
            tabs={rightTabs}
            activeTab={rightActiveTab}
            onTabChange={setRightActiveTab}
          >
            {renderRightPanel()}
          </TabPanel>
        </div>
      </div>
      <StatusBar />
    </div>
  );
};
export default CodeEditorPage;
