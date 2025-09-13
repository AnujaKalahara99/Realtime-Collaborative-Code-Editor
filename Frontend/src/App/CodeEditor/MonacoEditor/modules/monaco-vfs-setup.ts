import * as monaco from "monaco-editor";
import { VFSMonacoIntegration } from "../../../../lib/integration/vfs-monaco-integration";
import { VFSBridge } from "../../../../lib/vfs/vfs-bridge";
import { getLanguageFromFileName } from "./monaco-utils";

export const setupVFSWithMonacoTypeScript = (
  vfsBridge: VFSBridge | undefined,
  integrationRef: React.MutableRefObject<VFSMonacoIntegration | null>
) => {
  if (!vfsBridge || !integrationRef.current) {
    console.log("VFS bridge or integration not available for Monaco setup");
    return;
  }

  try {
    console.log("Setting up VFS with Monaco TypeScript service...");

    const vfsStore = vfsBridge.getVFSStore();
    const allEntries = vfsStore.getAllEntries();

    console.log("Setting up Monaco models for VFS files:", allEntries.size);

    allEntries.forEach((entry: any, path: string) => {
      if (entry.type === "file") {
        const language = getLanguageFromFileName(path);

        // Create Monaco model for this file if it doesn't exist
        const uri = monaco.Uri.file(path);
        let model = monaco.editor.getModel(uri);

        if (!model) {
          const content = entry.content || "";
          model = monaco.editor.createModel(content, language, uri);
          console.log(`Created Monaco model for ${path} (${language})`);
        } else {
          // Update existing model
          const content = entry.content || "";
          if (model.getValue() !== content) {
            model.setValue(content);
          }
          // Update language if needed
          const currentLanguage = model.getLanguageId();
          if (currentLanguage !== language) {
            monaco.editor.setModelLanguage(model, language);
          }
          console.log(`Updated Monaco model for ${path} (${language})`);
        }
      }
    });

    console.log("VFS Monaco TypeScript setup completed");
  } catch (error) {
    console.error("Error setting up VFS with Monaco TypeScript:", error);
  }
};

export const registerVFSCompletionProviders = (
  integrationRef: React.MutableRefObject<VFSMonacoIntegration | null>
) => {
  if (!integrationRef.current) {
    console.log("Integration not available for completion providers");
    return;
  }

  try {
    console.log("Registering VFS completion providers...");

    const createCompletionProvider = (language: string) => {
      return monaco.languages.registerCompletionItemProvider(language, {
        triggerCharacters: ['"', "'", "/", "."],
        provideCompletionItems: (model, position) => {
          const textUntilPosition = model.getValueInRange({
            startLineNumber: position.lineNumber,
            startColumn: 1,
            endLineNumber: position.lineNumber,
            endColumn: position.column,
          });

          // Check if we're in an import statement
          const importMatch = textUntilPosition.match(
            /import\s+.*from\s+['"]([^'"]*$)/
          );
          const requireMatch = textUntilPosition.match(
            /require\s*\(\s*['"]([^'"]*$)/
          );

          if (importMatch || requireMatch) {
            const query = (importMatch || requireMatch)![1];
            const vfsStore = integrationRef.current!.getVFSStore();
            const allEntries = vfsStore.getAllEntries();

            const suggestions: monaco.languages.CompletionItem[] = [];
            allEntries.forEach((entry: any, path: string) => {
              if (
                entry.type === "file" &&
                path.includes(query) &&
                path !== model.uri.path
              ) {
                const relativePath = path.startsWith("/")
                  ? path.substring(1)
                  : path;

                suggestions.push({
                  label: relativePath,
                  kind: monaco.languages.CompletionItemKind.File,
                  insertText: relativePath,
                  detail: `File: ${path}`,
                  documentation: `Import from VFS file: ${path}`,
                  range: {
                    startLineNumber: position.lineNumber,
                    endLineNumber: position.lineNumber,
                    startColumn: position.column - query.length,
                    endColumn: position.column,
                  },
                });
              }
            });

            return { suggestions };
          }

          return { suggestions: [] };
        },
      });
    };

    // Register completion provider for both JavaScript and TypeScript
    const jsCompletionProvider = createCompletionProvider("javascript");
    const tsCompletionProvider = createCompletionProvider("typescript");

    console.log("VFS completion providers registered successfully");

    return { jsCompletionProvider, tsCompletionProvider };
  } catch (error) {
    console.error("Error registering VFS completion providers:", error);
    return null;
  }
};
