// Re-export the main Monaco Editor component
export { default } from "./MonacoEditor";

// Export all the modular utilities for advanced usage
export * from "./modules/monaco-config";
export * from "./modules/monaco-vfs-setup";
export * from "./modules/monaco-diagnostics";
export * from "./modules/monaco-collaboration";
export * from "./modules/monaco-utils";

// Export types
export type { DiagnosticsCount } from "./modules/monaco-diagnostics";
export type { CollaborationRefs } from "./modules/monaco-collaboration";
