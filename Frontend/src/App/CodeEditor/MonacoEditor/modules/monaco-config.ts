import loader from "@monaco-editor/loader";
import * as monaco from "monaco-editor";

// Configure Monaco environment for Vite - only if not already configured
export const setupMonacoEnvironment = () => {
  if (typeof window !== "undefined" && !(window as any).MonacoEnvironment) {
    (window as any).MonacoEnvironment = {
      getWorker(_: string, label: string) {
        switch (label) {
          case "json":
            return new Worker(
              new URL(
                "monaco-editor/esm/vs/language/json/json.worker.js",
                import.meta.url
              ),
              { type: "module" }
            );
          case "css":
          case "scss":
          case "less":
            return new Worker(
              new URL(
                "monaco-editor/esm/vs/language/css/css.worker.js",
                import.meta.url
              ),
              { type: "module" }
            );
          case "html":
          case "handlebars":
          case "razor":
            return new Worker(
              new URL(
                "monaco-editor/esm/vs/language/html/html.worker.js",
                import.meta.url
              ),
              { type: "module" }
            );
          case "typescript":
          case "javascript":
            return new Worker(
              new URL(
                "monaco-editor/esm/vs/language/typescript/ts.worker.js",
                import.meta.url
              ),
              { type: "module" }
            );
          default:
            return new Worker(
              new URL(
                "monaco-editor/esm/vs/editor/editor.worker.js",
                import.meta.url
              ),
              { type: "module" }
            );
        }
      },
    };
  }
};

// Configure Monaco loader
export const initializeMonaco = () => {
  loader.config({ monaco });

  // Ensure Monaco is ready before using it
  return loader
    .init()
    .then((monacoInstance) => {
      console.log(
        "Monaco Editor loaded successfully:",
        monacoInstance.editor.getModels().length,
        "models"
      );
      return monacoInstance;
    })
    .catch((error) => {
      console.error("Failed to load Monaco Editor:", error);
      throw error;
    });
};

// Enhanced beforeMount configuration
export const configureMonacoBeforeMount = (monacoInstance: typeof monaco) => {
  console.log("Monaco about to mount - configuring global settings");

  // Add extra library definitions for better IntelliSense
  monacoInstance.languages.typescript.typescriptDefaults.addExtraLib(
    `
declare module "*.css" {
  const content: any;
  export default content;
}

declare module "*.json" {
  const content: any;
  export default content;
}

// React types for better JSX support
declare namespace React {
  interface Component<P = {}, S = {}> {}
  interface ComponentClass<P = {}> {}
  interface FunctionComponent<P = {}> {}
  type FC<P = {}> = FunctionComponent<P>;
  type ReactElement = any;
  type ReactNode = any;
}

declare const React: any;
declare const process: { env: Record<string, string> };
    `,
    "ts:extra-libs.d.ts"
  );

  // Configure JavaScript defaults too
  monacoInstance.languages.typescript.javascriptDefaults.addExtraLib(
    `
// Common Node.js globals for JavaScript
declare const process: { env: Record<string, string> };
declare const require: (id: string) => any;
declare const module: { exports: any };
declare const exports: any;
declare const console: Console;
    `,
    "js:extra-libs.d.ts"
  );

  // Enhanced language features
  monacoInstance.languages.typescript.typescriptDefaults.setInlayHintsOptions({
    includeInlayParameterNameHints: "all",
    includeInlayParameterNameHintsWhenArgumentMatchesName: true,
    includeInlayFunctionParameterTypeHints: true,
    includeInlayVariableTypeHints: true,
    includeInlayPropertyDeclarationTypeHints: true,
    includeInlayFunctionLikeReturnTypeHints: true,
    includeInlayEnumMemberValueHints: true,
  });
};

// Configure Monaco language services after mount
export const configureMonacoLanguageServices = () => {
  console.log("Configuring Monaco language services...");

  // Configure TypeScript/JavaScript language features
  monaco.languages.typescript.typescriptDefaults.setEagerModelSync(true);
  monaco.languages.typescript.javascriptDefaults.setEagerModelSync(true);

  // Enhanced diagnostics options
  const diagnosticsOptions = {
    noSemanticValidation: false,
    noSyntaxValidation: false,
    noSuggestionDiagnostics: false,
    // Disable module resolution errors - we'll handle these with VFS
    diagnosticCodesToIgnore: [2307, 2345, 2304], // "Cannot find module" errors
  };

  monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions(
    diagnosticsOptions
  );
  monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions(
    diagnosticsOptions
  );

  // Set compiler options for better IntelliSense
  const compilerOptions = {
    target: monaco.languages.typescript.ScriptTarget.ES2020,
    allowNonTsExtensions: true,
    moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
    module: monaco.languages.typescript.ModuleKind.ESNext,
    noEmit: true,
    esModuleInterop: true,
    allowJs: true,
    checkJs: false,
    lib: ["ES2020", "DOM"],
    allowSyntheticDefaultImports: true,
    resolveJsonModule: true,
    skipLibCheck: true,
    moduleDetection: "force",
  };

  monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
    ...compilerOptions,
    jsx: monaco.languages.typescript.JsxEmit.React,
    reactNamespace: "React",
    typeRoots: ["node_modules/@types"],
  });

  monaco.languages.typescript.javascriptDefaults.setCompilerOptions(
    compilerOptions
  );

  console.log("Monaco language services configured successfully");
};

// Initialize Monaco setup
setupMonacoEnvironment();
initializeMonaco();
