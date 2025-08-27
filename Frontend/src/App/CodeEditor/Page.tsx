import React, { useState, useRef, useEffect } from "react";
import { FileText, GitBranch, MessageCircle, Play, Bot } from "lucide-react";
import ProjectManagementPanel from "./ProjectManagementPanel/ProjectManagementPanel";
import GitPanel from "./GitPanel";
import AskAIPanel from "./AIPanel";
import LiveChatPanel from "./LiveChatPanel";
import CompilerPanel from "./CompilerPanel";
import NavigationBar from "./NavigationBar";
import StatusBar from "./StatusBar";
import MonacoEditor from "./MonacoEditor/MonacoEditor";
import { useTheme } from "../../Contexts/ThemeProvider";
import type { FileNode } from "./ProjectManagementPanel/file.types";

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
      <div
        className={`flex ${theme.surfaceSecondary} ${theme.border} border-b`}
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex items-center gap-2 px-3 py-2 text-xs font-medium  ${
              theme.hover
            } transition-colors ${
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

      <div className="flex-1 overflow-hidden">{children}</div>
    </div>
  );
};

const CodeEditorPage = () => {
  // console.log("CodeEditorPage rendered");

  const { theme } = useTheme();

  const [selectedFile, setSelectedFile] = useState<FileNode | null>(null);
  const [leftActiveTab, setLeftActiveTab] = useState("pm");
  const [rightActiveTab, setRightActiveTab] = useState("chat");

  const [leftPanelWidth, setLeftPanelWidth] = useState(320); // Default width 320px
  const [rightPanelWidth, setRightPanelWidth] = useState(320);
  const minPanelWidth = 200; // Minimum width in pixels
  const maxPanelWidth = 600; // Optional: maximum width
  const containerRef = useRef<HTMLDivElement>(null);

  const leftResizeRef = useRef<HTMLDivElement>(null);
  const rightResizeRef = useRef<HTMLDivElement>(null);
  const isDraggingLeft = useRef(false);
  const isDraggingRight = useRef(false);
  const startXLeft = useRef(0);
  const startXRight = useRef(0);
  const startWidthLeft = useRef(0);
  const startWidthRight = useRef(0);

  const leftTabs = [
    { id: "pm", label: "Files", icon: <FileText size={14} /> },
    { id: "git", label: "Git", icon: <GitBranch size={14} /> },
  ];

  const rightTabs = [
    { id: "chat", label: "Chat", icon: <MessageCircle size={14} /> },
    { id: "compiler", label: "Compiler", icon: <Play size={14} /> },
    { id: "ai", label: "Ask AI", icon: <Bot size={14} /> },
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
        return (
          <LiveChatPanel
            roomName="ChatSpace"
            username={username}
            wsUrl="ws://144.24.128.44:4455"
          />
        );
      case "ai":
        return <AskAIPanel />;
    }
  };

  // Get available total width
  const getAvailableWidth = () => {
    if (!containerRef.current) return window.innerWidth;
    return containerRef.current.offsetWidth;
  };

  // Handle left panel resizing with constraints
  useEffect(() => {
    const leftResizer = leftResizeRef.current;
    if (!leftResizer) return;

    const onMouseDown = (e: MouseEvent) => {
      e.preventDefault();
      isDraggingLeft.current = true;
      startXLeft.current = e.clientX;
      startWidthLeft.current = leftPanelWidth;
      document.body.style.cursor = "ew-resize";
      document.body.style.userSelect = "none";
    };

    const onMouseUp = () => {
      isDraggingLeft.current = false;
      document.body.style.removeProperty("cursor");
      document.body.style.removeProperty("user-select");
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDraggingLeft.current) return;

      const totalWidth = getAvailableWidth();
      const maxAllowedWidth = totalWidth - rightPanelWidth - minPanelWidth - 2; // 2px for the resize handles

      const deltaX = e.clientX - startXLeft.current;
      const newWidth = Math.max(
        minPanelWidth,
        Math.min(maxAllowedWidth, startWidthLeft.current + deltaX)
      );
      setLeftPanelWidth(newWidth);
    };

    leftResizer.addEventListener("mousedown", onMouseDown);
    document.addEventListener("mouseup", onMouseUp);
    document.addEventListener("mousemove", onMouseMove);

    return () => {
      leftResizer.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("mouseup", onMouseUp);
      document.removeEventListener("mousemove", onMouseMove);
    };
  }, [leftPanelWidth, rightPanelWidth]);

  // Handle right panel resizing with constraints
  useEffect(() => {
    const rightResizer = rightResizeRef.current;
    if (!rightResizer) return;

    const onMouseDown = (e: MouseEvent) => {
      e.preventDefault();
      isDraggingRight.current = true;
      startXRight.current = e.clientX;
      startWidthRight.current = rightPanelWidth;
      document.body.style.cursor = "ew-resize";
      document.body.style.userSelect = "none";
    };

    const onMouseUp = () => {
      isDraggingRight.current = false;
      document.body.style.removeProperty("cursor");
      document.body.style.removeProperty("user-select");
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDraggingRight.current) return;

      const totalWidth = getAvailableWidth();
      const maxAllowedWidth = totalWidth - leftPanelWidth - minPanelWidth - 2; // 2px for the resize handles

      const deltaX = startXRight.current - e.clientX;
      const newWidth = Math.max(
        minPanelWidth,
        Math.min(maxAllowedWidth, startWidthRight.current + deltaX)
      );
      setRightPanelWidth(newWidth);
    };

    rightResizer.addEventListener("mousedown", onMouseDown);
    document.addEventListener("mouseup", onMouseUp);
    document.addEventListener("mousemove", onMouseMove);

    return () => {
      rightResizer.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("mouseup", onMouseUp);
      document.removeEventListener("mousemove", onMouseMove);
    };
  }, [leftPanelWidth, rightPanelWidth]);

  // Add window resize handler to ensure panels fit when window is resized
  useEffect(() => {
    const handleResize = () => {
      const totalWidth = getAvailableWidth();
      const combinedPanelWidth = leftPanelWidth + rightPanelWidth + 2; // 2px for resize handles
      const minMiddleWidth = minPanelWidth;

      // If panels are too wide for the window, adjust them proportionally
      if (combinedPanelWidth + minMiddleWidth > totalWidth) {
        const excessWidth = combinedPanelWidth + minMiddleWidth - totalWidth;
        const leftRatio = leftPanelWidth / combinedPanelWidth;

        const newLeftWidth = Math.max(
          minPanelWidth,
          leftPanelWidth - excessWidth * leftRatio
        );
        const newRightWidth = Math.max(
          minPanelWidth,
          rightPanelWidth - excessWidth * (1 - leftRatio)
        );

        setLeftPanelWidth(newLeftWidth);
        setRightPanelWidth(newRightWidth);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [leftPanelWidth, rightPanelWidth]);

  return (
    <div className="h-screen bg-gray-900 flex flex-col">
      <NavigationBar />
      <div ref={containerRef} className="flex-1 flex overflow-hidden">
        <div
          style={{
            width: `${leftPanelWidth}px`,
            minWidth: `${minPanelWidth}px`,
            flexShrink: 0,
          }}
          // className="border-r border-gray-600"
        >
          <TabPanel
            tabs={leftTabs}
            activeTab={leftActiveTab}
            onTabChange={setLeftActiveTab}
          >
            {renderLeftPanel()}
          </TabPanel>
        </div>

        <div
          ref={leftResizeRef}
          className={`w-[2px] ${theme.active} hover:bg-blue-500 cursor-ew-resize transition-colors flex-shrink-0`}
        ></div>

        <div className="flex-1 flex flex-col min-w-0">
          <MonacoEditor selectedFile={selectedFile} />
        </div>

        <div
          ref={rightResizeRef}
          className={`w-[2px] ${theme.active} hover:bg-blue-500 cursor-ew-resize transition-colors flex-shrink-0`}
        ></div>

        <div
          style={{
            width: `${rightPanelWidth}px`,
            minWidth: `${minPanelWidth}px`,
            flexShrink: 0,
          }}
          // className="border-l border-gray-600"
        >
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
