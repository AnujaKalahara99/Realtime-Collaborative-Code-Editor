import * as monaco from "monaco-editor";
import { MonacoBinding } from "y-monaco";
import type { FileNode } from "../../ProjectManagementPanel/file.types";
import { VFSBridge } from "../../../../lib/vfs/vfs-bridge";
import { getLanguageFromFileName } from "./monaco-utils";
import { type CollaborationUser } from "../../../../Contexts/EditorContext";

export interface CollaborationRefs {
  currentBindingRef: React.MutableRefObject<MonacoBinding | null>;
  currentFileRef: React.MutableRefObject<string | null>;
  contentUnsubscribeRef: React.MutableRefObject<(() => void) | null>;
}

export const BindEditorToFile = (
  file: FileNode,
  editorRef: React.MutableRefObject<monaco.editor.IStandaloneCodeEditor | null>,
  collaborationRefs: CollaborationRefs,
  vfsBridge: VFSBridge | undefined,
  getAwareness: () => any,
  getFileText: (fileId: string) => any,
  initializeFileContent: (fileId: string, content: string) => void,
  onFileContentChange: (
    fileId: string,
    callback: (content: string) => void
  ) => () => void,
  debouncedUpdateDiagnostics?: (filePath: string, content?: string) => void
) => {
  // const {
  //   getAwareness,
  //   getFileText,
  //   initializeFileContent,
  //   onFileContentChange,
  // } = useEditorCollaboration();

  if (!editorRef.current || !vfsBridge) return;

  const editor = editorRef.current;

  // Destroy previous binding and content subscription
  if (collaborationRefs.currentBindingRef.current) {
    collaborationRefs.currentBindingRef.current.destroy();
    collaborationRefs.currentBindingRef.current = null;
  }
  if (collaborationRefs.contentUnsubscribeRef.current) {
    collaborationRefs.contentUnsubscribeRef.current();
    collaborationRefs.contentUnsubscribeRef.current = null;
  }

  try {
    // Get the Y.Text for this file
    const fileYText = getFileText(file.id);

    // Initialize file content if needed
    if (file.content) {
      initializeFileContent(file.id, file.content);
    }

    // Get current content from Y.Text
    const currentYContent = fileYText!.toString();

    // Get the current model from the editor (created by @monaco-editor/react)
    const currentModel = editor.getModel();

    if (currentModel) {
      // Update the existing model instead of creating a new one
      if (currentModel.getValue() !== currentYContent) {
        currentModel.setValue(currentYContent);
      }

      // Set the correct language for this file
      const computedLanguage = getLanguageFromFileName(file.name);
      if (currentModel.getLanguageId() !== computedLanguage) {
        monaco.editor.setModelLanguage(currentModel, computedLanguage);
      }

      // Create MonacoBinding with the existing model
      const awareness = getAwareness();
      if (awareness && fileYText) {
        collaborationRefs.currentBindingRef.current = new MonacoBinding(
          fileYText,
          currentModel,
          new Set([editor]),
          awareness
        );
      }
    }

    // Save current file ref
    collaborationRefs.currentFileRef.current = file.id;

    // Subscribe to content changes (keep VFS up-to-date)
    collaborationRefs.contentUnsubscribeRef.current = onFileContentChange(
      file.id,
      (content: string) => {
        if (vfsBridge) {
          vfsBridge.updateFileContent(file.id, content);
          // Update diagnostics for the new content
          const filePath = vfsBridge.getPathById(file.id);
          if (filePath && debouncedUpdateDiagnostics) {
            debouncedUpdateDiagnostics(filePath, content);
          }
        }
      }
    );

    // Update diagnostics for the newly opened file
    const filePath = vfsBridge.getPathById(file.id);
    if (filePath && debouncedUpdateDiagnostics) {
      debouncedUpdateDiagnostics(filePath);
    }
  } catch (error) {
    console.error("Error binding editor to file:", error);
  }
};

export const updateCollaborationUsers = (
  fileId: string,
  collaborationService: any,
  setFileUsers: React.Dispatch<React.SetStateAction<CollaborationUser[]>>
) => {
  try {
    // Use the correct method name from the collaboration service
    const users = collaborationService.getUsersInFile(fileId);
    setFileUsers(users);
    console.log("Updated collaboration users for file:", fileId, users);
  } catch (error) {
    console.error("Error updating collaboration users:", error);
    setFileUsers([]);
  }
};

export const setupCollaborationListeners = (
  fileId: string,
  collaborationService: any,
  setFileUsers: React.Dispatch<React.SetStateAction<CollaborationUser[]>>
) => {
  const updateUsers = () => {
    updateCollaborationUsers(fileId, collaborationService, setFileUsers);
  };

  // Set up user change listeners using the correct method
  const unsubscribeUsers = collaborationService.onUsersChange(
    (users: CollaborationUser[]) => {
      // Filter to only show users in the current file
      const fileUsers = users.filter(
        (user: any) => user.cursor?.fileId === fileId
      );
      setFileUsers(fileUsers);
    }
  );

  // Initial user update
  updateUsers();

  // Return cleanup function
  return () => {
    unsubscribeUsers();
  };
};

export const cleanupCollaboration = (collaborationRefs: CollaborationRefs) => {
  try {
    // Clean up binding
    if (collaborationRefs.currentBindingRef.current) {
      collaborationRefs.currentBindingRef.current.destroy();
      collaborationRefs.currentBindingRef.current = null;
    }

    // Clean up content listener
    if (collaborationRefs.contentUnsubscribeRef.current) {
      collaborationRefs.contentUnsubscribeRef.current();
      collaborationRefs.contentUnsubscribeRef.current = null;
    }

    collaborationRefs.currentFileRef.current = null;
    console.log("Cleaned up collaboration resources");
  } catch (error) {
    console.error("Error cleaning up collaboration:", error);
  }
};
