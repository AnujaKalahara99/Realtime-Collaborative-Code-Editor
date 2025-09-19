import React, { useState, useRef, useEffect } from "react";
import { useTheme } from "../../Contexts/ThemeProvider";

export type Tab = {
  id: string;
  label: string;
  icon: React.ReactNode;
};

export type TabPanelProps = {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (id: string) => void;
  children: React.ReactNode;
};

export const TabPanel: React.FC<TabPanelProps> = ({
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

export type PanelSystemProps = {
  leftContent: (activeTab: string) => React.ReactNode;
  rightContent: (activeTab: string) => React.ReactNode;
  leftTabs: Tab[];
  rightTabs: Tab[];
  defaultLeftTab: string;
  defaultRightTab: string;
  minPanelWidth?: number;
  defaultLeftPanelWidth?: number;
  defaultRightPanelWidth?: number;
  onLeftActiveTabChange?: (tabId: string) => void;
  onRightActiveTabChange?: (tabId: string) => void;
  children: React.ReactNode; // Add this line to support children
};

export const PanelSystem: React.FC<PanelSystemProps> = ({
  leftContent,
  rightContent,
  leftTabs,
  rightTabs,
  defaultLeftTab,
  defaultRightTab,
  minPanelWidth = 200,
  defaultLeftPanelWidth = 320,
  defaultRightPanelWidth = 320,
  onLeftActiveTabChange,
  onRightActiveTabChange,
  children,
}) => {
  const { theme } = useTheme();

  const [leftActiveTab, setLeftActiveTab] = useState(defaultLeftTab);
  const [rightActiveTab, setRightActiveTab] = useState(defaultRightTab);

  const [leftPanelWidth, setLeftPanelWidth] = useState(defaultLeftPanelWidth);
  const [rightPanelWidth, setRightPanelWidth] = useState(
    defaultRightPanelWidth
  );

  const containerRef = useRef<HTMLDivElement>(null);
  const leftResizeRef = useRef<HTMLDivElement>(null);
  const rightResizeRef = useRef<HTMLDivElement>(null);
  const isDraggingLeft = useRef(false);
  const isDraggingRight = useRef(false);
  const startXLeft = useRef(0);
  const startXRight = useRef(0);
  const startWidthLeft = useRef(0);
  const startWidthRight = useRef(0);

  // Handler for left tab change
  const handleLeftTabChange = (tabId: string) => {
    setLeftActiveTab(tabId);
    if (onLeftActiveTabChange) {
      onLeftActiveTabChange(tabId);
    }
  };

  // Handler for right tab change
  const handleRightTabChange = (tabId: string) => {
    setRightActiveTab(tabId);
    if (onRightActiveTabChange) {
      onRightActiveTabChange(tabId);
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
  }, [leftPanelWidth, rightPanelWidth, minPanelWidth]);

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
  }, [leftPanelWidth, rightPanelWidth, minPanelWidth]);

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
  }, [leftPanelWidth, rightPanelWidth, minPanelWidth]);

  return (
    <div ref={containerRef} className="flex-1 flex overflow-hidden">
      <div
        style={{
          width: `${leftPanelWidth}px`,
          minWidth: `${minPanelWidth}px`,
          flexShrink: 0,
        }}
      >
        <TabPanel
          tabs={leftTabs}
          activeTab={leftActiveTab}
          onTabChange={handleLeftTabChange}
        >
          {leftContent(leftActiveTab)}
        </TabPanel>
      </div>

      <div
        ref={leftResizeRef}
        className={`w-[2px] ${theme.active} hover:bg-blue-500 cursor-ew-resize transition-colors flex-shrink-0`}
      ></div>

      <div className="flex-1 flex flex-col min-w-0">{children}</div>

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
      >
        <TabPanel
          tabs={rightTabs}
          activeTab={rightActiveTab}
          onTabChange={handleRightTabChange}
        >
          {rightContent(rightActiveTab)}
        </TabPanel>
      </div>
    </div>
  );
};
