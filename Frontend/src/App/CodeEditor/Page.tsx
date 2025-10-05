import { useState } from "react";
import { FileText, GitBranch, MessageCircle, Play, Bot } from "lucide-react";
import ProjectManagementPanel from "./ProjectManagementPanel/ProjectManagementPanel";
import GitPanel from "./GitPanel/GitPanel";
import AskAIPanel from "./AIPanel";
import LiveChatPanel from "./LiveChatPanel";
import CompilerPanel from "./CompilerPanel";
import NavigationBar from "./NavigationBar";
import StatusBar from "./StatusBar";
import MonacoEditor from "./MonacoEditor/MonacoEditor";
import { PanelSystem, type Tab } from "./PanelSystem";
import type { FileNode } from "./ProjectManagementPanel/file.types";

const CodeEditorPage = () => {
  const [selectedFile, setSelectedFile] = useState<FileNode | null>(null);

  const leftTabs: Tab[] = [
    { id: "pm", label: "Files", icon: <FileText size={14} /> },
    { id: "git", label: "Git", icon: <GitBranch size={14} /> },
  ];

  const rightTabs: Tab[] = [
    { id: "chat", label: "Chat", icon: <MessageCircle size={14} /> },
    { id: "compiler", label: "Compiler", icon: <Play size={14} /> },
    { id: "ai", label: "Ask AI", icon: <Bot size={14} /> },
  ];

  const renderLeftPanel = (activeTab: string) => {
    switch (activeTab) {
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

  const renderRightPanel = (activeTab: string) => {
    switch (activeTab) {
      case "chat":
        return <LiveChatPanel />;
      case "compiler":
        return <CompilerPanel selectedFile={selectedFile} />;
      case "ai":
        return <AskAIPanel />;
      default:
        return <LiveChatPanel />;
    }
  };

  return (
    <div className="h-screen bg-gray-900 flex flex-col">
      <NavigationBar />
      <PanelSystem
        leftTabs={leftTabs}
        rightTabs={rightTabs}
        leftContent={renderLeftPanel}
        rightContent={renderRightPanel}
        defaultLeftTab="pm"
        defaultRightTab="chat"
        minPanelWidth={200}
        defaultLeftPanelWidth={320}
        defaultRightPanelWidth={320}
      >
        <MonacoEditor selectedFile={selectedFile} />
      </PanelSystem>
      <StatusBar />
    </div>
  );
};

export default CodeEditorPage;
