import { useEffect, useRef, useState, useCallback } from "react";
import * as monaco from "monaco-editor";
import {
  useEditorCollaboration,
  type CollaborationUser,
} from "../../../Contexts/EditorContext";
import "./CollaborativeCursor.css";

interface CollaborativeCursorProps {
  editor: monaco.editor.IStandaloneCodeEditor | null;
  selectedFile: { id: string; type: string } | null;
}

interface CursorDecoration {
  id: string;
  decorationIds: string[];
  nameWidgetId: string;
}

export default function CollaborativeCursor({
  editor,
  selectedFile,
}: CollaborativeCursorProps) {
  const [users, setUsers] = useState<CollaborationUser[]>([]);
  const cursorsRef = useRef<Map<number, CursorDecoration>>(new Map());
  const nameWidgetsRef = useRef<Map<string, monaco.editor.IContentWidget>>(
    new Map()
  );
  const collaborationService = useEditorCollaboration();

  const clearAllCursors = useCallback(() => {
    if (!editor) return;

    cursorsRef.current.forEach((cursor) => {
      editor.deltaDecorations(cursor.decorationIds, []);
      const widget = nameWidgetsRef.current.get(cursor.nameWidgetId);
      if (widget) {
        editor.removeContentWidget(widget);
        nameWidgetsRef.current.delete(cursor.nameWidgetId);
      }
    });

    cursorsRef.current.clear();
  }, [editor]);

  useEffect(() => {
    if (!editor || !selectedFile || selectedFile.type !== "file") {
      clearAllCursors();
      return;
    }

    const updateUsers = () => {
      const fileUsers = collaborationService.getUsersInFile(selectedFile.id);
      setUsers(fileUsers || []);
    };

    // Instead of onUsersChange, we'll use an interval to periodically update users
    // as EditorContext doesn't provide a subscription mechanism for user changes
    const userUpdateInterval = setInterval(updateUsers, 500);
    updateUsers(); // Initial update

    const handleCursorChange = () => {
      if (!editor) return;

      const position = editor.getPosition();
      const selection = editor.getSelection();

      if (position) {
        collaborationService.updateCursorPosition(selectedFile.id, {
          line: position.lineNumber,
          column: position.column,
          selection: selection
            ? {
                startLine: selection.startLineNumber,
                startColumn: selection.startColumn,
                endLine: selection.endLineNumber,
                endColumn: selection.endColumn,
              }
            : undefined,
        });
      }
    };

    const cursorChangeDisposable =
      editor.onDidChangeCursorPosition(handleCursorChange);
    const selectionChangeDisposable =
      editor.onDidChangeCursorSelection(handleCursorChange);

    return () => {
      clearInterval(userUpdateInterval);
      cursorChangeDisposable.dispose();
      selectionChangeDisposable.dispose();
      clearAllCursors();
    };
  }, [editor, selectedFile, collaborationService, clearAllCursors]);

  const renderUserCursor = useCallback(
    (user: CollaborationUser, clientId: number) => {
      if (!editor || !user.cursor) return;

      const { line, column, selection } = user.cursor;
      const decorationIds: string[] = [];

      if (
        selection &&
        (selection.startLine !== selection.endLine ||
          selection.startColumn !== selection.endColumn)
      ) {
        const selectionDecorations = [
          {
            range: new monaco.Range(
              selection.startLine,
              selection.startColumn,
              selection.endLine,
              selection.endColumn
            ),
            options: {
              className: "collaborative-selection",
              stickiness:
                monaco.editor.TrackedRangeStickiness
                  .NeverGrowsWhenTypingAtEdges,
              inlineClassName: "collaborative-selection-inline",
              inlineStyle: `background-color: ${user.color}30;`,
            },
          },
        ];

        const selectionIds = editor.deltaDecorations([], selectionDecorations);
        decorationIds.push(...selectionIds);
      }

      const cursorContainer = document.createElement("div");
      cursorContainer.className = "collaborative-cursor-container";

      const cursorHoverArea = document.createElement("div");
      cursorHoverArea.className = "collaborative-cursor-hover-area";

      const cursorLine = document.createElement("div");
      cursorLine.className = "collaborative-cursor-line";
      cursorLine.style.backgroundColor = user.color;

      const nameTag = document.createElement("div");
      nameTag.className = "collaborative-cursor-name";
      nameTag.style.backgroundColor = user.color;
      nameTag.textContent = user.name;

      cursorContainer.appendChild(cursorLine);
      cursorContainer.appendChild(cursorHoverArea);
      cursorContainer.appendChild(nameTag);

      cursorHoverArea.addEventListener("mouseenter", () => {
        nameTag.style.opacity = "1";
        nameTag.style.visibility = "visible";
      });

      cursorHoverArea.addEventListener("mouseleave", () => {
        nameTag.style.opacity = "0";
        nameTag.style.visibility = "hidden";
      });

      const cursorWidget: monaco.editor.IContentWidget = {
        getId: () => `cursor-widget-${clientId}`,
        getDomNode: () => cursorContainer,
        getPosition: () => ({
          position: { lineNumber: line, column },
          preference: [monaco.editor.ContentWidgetPositionPreference.EXACT],
        }),
      };

      editor.addContentWidget(cursorWidget);
      nameWidgetsRef.current.set(`cursor-widget-${clientId}`, cursorWidget);

      cursorsRef.current.set(clientId, {
        id: `cursor-${clientId}`,
        decorationIds,
        nameWidgetId: `cursor-widget-${clientId}`,
      });
    },
    [editor]
  );

  useEffect(() => {
    if (!editor) return;

    clearAllCursors();

    users.forEach((user, index) => {
      if (user.cursor) {
        renderUserCursor(user, index);
      }
    });

    const addHoverListeners = () => {
      const editorDom = editor.getDomNode();
      if (!editorDom) return;

      const viewLines = editorDom.querySelectorAll(".view-line");
      viewLines.forEach((line) => {
        line.addEventListener("mouseenter", handleLineHover);
        line.addEventListener("mouseleave", handleLineLeave);
      });
    };

    const handleLineHover = (e: Event) => {
      const line = e.target as HTMLElement;
      const nameWidgets = line.querySelectorAll(".collaborative-cursor-name");
      nameWidgets.forEach((widget) => {
        (widget as HTMLElement).style.opacity = "1";
        (widget as HTMLElement).style.visibility = "visible";
      });
    };

    const handleLineLeave = (e: Event) => {
      const line = e.target as HTMLElement;
      const nameWidgets = line.querySelectorAll(".collaborative-cursor-name");
      nameWidgets.forEach((widget) => {
        (widget as HTMLElement).style.opacity = "0";
        (widget as HTMLElement).style.visibility = "hidden";
      });
    };

    setTimeout(addHoverListeners, 100);
  }, [users, editor, clearAllCursors, renderUserCursor]);

  // Removed duplicate renderUserCursor function as it's now defined with useCallback above

  // Removed duplicate clearAllCursors function as it's now defined with useCallback above

  return null;
}
