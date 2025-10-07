import type { VFSStore } from "../vfs/vfs-store";
import { Bundler } from "../bundler/bundler";
import { MonacoFileProvider } from "../monaco/file-provider";
import { DependencyManager } from "../dependencies/dependency-manager";
import { MonacoDiagnosticsProvider } from "../monaco/diagnostics-provider";
import type { PluginOptions } from "../bundler/esbuildPlugin";
import * as monaco from "monaco-editor";

export interface IntegrationOptions {
  enableDiagnostics?: boolean;
  enableAutoCompletion?: boolean;
  enableCodeActions?: boolean;
  bundlerOptions?: PluginOptions;
  entryPoints?: string[];
}

export interface BuildResult {
  success: boolean;
  code?: string;
  error?: string;
  diagnostics: {
    errors: number;
    warnings: number;
    circularDependencies: string[][];
    unusedFiles: string[];
  };
  dependencies: {
    resolved: number;
    total: number;
    graph: Map<string, string[]>;
  };
}

/**
 * VFS Monaco Integration Service
 * Orchestrates the integration between VFS, Monaco Editor, esbuild, and dependency management
 */
export class VFSMonacoIntegration {
  private vfs: VFSStore;
  private bundler: Bundler;
  private fileProvider: MonacoFileProvider;
  private dependencyManager: DependencyManager;
  private diagnosticsProvider: MonacoDiagnosticsProvider | null = null;
  private disposables: monaco.IDisposable[] = [];
  private options: IntegrationOptions;

  constructor(vfs: VFSStore, options: IntegrationOptions = {}) {
    this.vfs = vfs;
    this.options = {
      enableDiagnostics: true,
      enableAutoCompletion: true,
      enableCodeActions: true,
      bundlerOptions: {
        enableDetailedErrors: true,
        enableDependencyTracking: true,
        allowedExtensions: [".js", ".jsx", ".ts", ".tsx", ".json", ".css"],
      },
      entryPoints: [],
      ...options,
    };

    // Initialize services
    this.dependencyManager = new DependencyManager(this.vfs);
    this.fileProvider = new MonacoFileProvider(this.vfs);
    this.bundler = new Bundler(this.vfs);

    this.initializeServices();
  }

  /**
   * Initialize all services
   */
  private initializeServices(): void {
    // Initialize diagnostics provider if enabled
    if (this.options.enableDiagnostics) {
      this.diagnosticsProvider = new MonacoDiagnosticsProvider(
        this.vfs,
        this.dependencyManager
      );
    }

    // Setup Monaco providers
    this.setupMonacoProviders();

    // Initialize file models
    this.fileProvider.initializeModels();

    // Initial diagnostics update
    if (this.diagnosticsProvider) {
      this.diagnosticsProvider.updateAllDiagnostics();
    }
  }

  /**
   * Setup Monaco Editor providers
   */
  private setupMonacoProviders(): void {
    if (this.options.enableAutoCompletion && this.diagnosticsProvider) {
      const completionDisposable =
        this.diagnosticsProvider.setupCompletionProvider();
      this.disposables.push(completionDisposable);
    }

    if (this.options.enableCodeActions && this.diagnosticsProvider) {
      const codeActionDisposable = this.diagnosticsProvider.setupCodeActions();
      this.disposables.push(codeActionDisposable);
    }

    // Hover provider for unresolved imports
    if (this.diagnosticsProvider) {
      const hoverDisposable = this.diagnosticsProvider.setupHoverProvider();
      this.disposables.push(hoverDisposable);
    }

    // Setup import path validation
    this.setupImportValidation();
  }

  /**
   * Setup real-time import path validation
   */
  private setupImportValidation(): void {
    // Listen for model content changes
    const disposable = monaco.editor.onDidCreateModel((model) => {
      const changeDisposable = model.onDidChangeContent(() => {
        const filePath = this.uriToPath(model.uri);

        // Debounce validation to avoid excessive updates
        setTimeout(() => {
          if (this.diagnosticsProvider) {
            this.diagnosticsProvider.updateDiagnostics(filePath);
          }
        }, 300);
      });

      this.disposables.push(changeDisposable);
    });

    this.disposables.push(disposable);
  }

  /**
   * Convert Monaco URI to file path
   */
  private uriToPath(uri: monaco.Uri): string {
    return uri.path;
  }

  /**
   * Build project with the given entry point
   */
  public async build(entryPoint: string): Promise<BuildResult> {
    try {
      // Ensure bundler is initialized
      await this.bundler.initialize();

      // Get dependency analysis before build
      const depGraph = this.dependencyManager.getDependencyGraph();
      const circularDeps = this.dependencyManager.findCircularDependencies();
      const unusedFiles = this.dependencyManager.getUnusedFiles(
        this.options.entryPoints || [entryPoint]
      );

      // Build with enhanced plugin
      const buildResult = await this.bundler.bundle(entryPoint);

      // Collect diagnostics
      const allErrors = depGraph.errors.filter(
        (err) => err.severity === "error"
      );
      const allWarnings = depGraph.errors.filter(
        (err) => err.severity === "warning"
      );

      const result: BuildResult = {
        success: buildResult.error === null && allErrors.length === 0,
        code: buildResult.code,
        error: buildResult.error || undefined,
        diagnostics: {
          errors: allErrors.length,
          warnings: allWarnings.length,
          circularDependencies: circularDeps,
          unusedFiles,
        },
        dependencies: {
          resolved: Array.from(depGraph.dependencies.values()).flat().length,
          total:
            Array.from(depGraph.dependencies.values()).flat().length +
            depGraph.errors.length,
          graph: depGraph.dependencies,
        },
      };

      // Log build summary
      this.logBuildSummary(result);

      return result;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        diagnostics: {
          errors: 1,
          warnings: 0,
          circularDependencies: [],
          unusedFiles: [],
        },
        dependencies: {
          resolved: 0,
          total: 0,
          graph: new Map(),
        },
      };
    }
  }

  /**
   * Log build summary to console
   */
  private logBuildSummary(result: BuildResult): void {
    console.group("🔨 Build Summary");
    console.log(`✅ Success: ${result.success}`);

    if (result.error) {
      console.error(`❌ Error: ${result.error}`);
    }

    console.log(`📊 Diagnostics:`);
    console.log(`  - Errors: ${result.diagnostics.errors}`);
    console.log(`  - Warnings: ${result.diagnostics.warnings}`);
    console.log(
      `  - Circular Dependencies: ${result.diagnostics.circularDependencies.length}`
    );
    console.log(`  - Unused Files: ${result.diagnostics.unusedFiles.length}`);

    console.log(`🔗 Dependencies:`);
    console.log(`  - Resolved: ${result.dependencies.resolved}`);
    console.log(`  - Total: ${result.dependencies.total}`);
    console.log(
      `  - Success Rate: ${
        result.dependencies.total > 0
          ? Math.round(
              (result.dependencies.resolved / result.dependencies.total) * 100
            )
          : 100
      }%`
    );

    if (result.diagnostics.circularDependencies.length > 0) {
      console.warn("🔄 Circular Dependencies Detected:");
      result.diagnostics.circularDependencies.forEach((cycle, index) => {
        console.warn(`  ${index + 1}. ${cycle.join(" → ")}`);
      });
    }

    if (result.diagnostics.unusedFiles.length > 0) {
      console.warn("📁 Unused Files:");
      result.diagnostics.unusedFiles.forEach((file) => {
        console.warn(`  - ${file}`);
      });
    }

    console.groupEnd();
  }

  /**
   * Get dependency graph visualization data
   */
  public getDependencyGraphData(): {
    nodes: Array<{ id: string; label: string; type: "file" | "external" }>;
    edges: Array<{ from: string; to: string; type: "import" | "require" }>;
  } {
    const depGraph = this.dependencyManager.getDependencyGraph();
    const nodes: Array<{
      id: string;
      label: string;
      type: "file" | "external";
    }> = [];
    const edges: Array<{
      from: string;
      to: string;
      type: "import" | "require";
    }> = [];
    const processedNodes = new Set<string>();

    // Add nodes for all files
    depGraph.dependencies.forEach((deps, file) => {
      if (!processedNodes.has(file)) {
        nodes.push({
          id: file,
          label: file.split("/").pop() || file,
          type: "file",
        });
        processedNodes.add(file);
      }

      deps.forEach((dep) => {
        if (!processedNodes.has(dep)) {
          nodes.push({
            id: dep,
            label: dep.split("/").pop() || dep,
            type: dep.startsWith("/") ? "file" : "external",
          });
          processedNodes.add(dep);
        }

        edges.push({
          from: file,
          to: dep,
          type: "import", // Simplified - could be enhanced to detect require vs import
        });
      });
    });

    return { nodes, edges };
  }

  /**
   * Get file dependencies for a specific file
   */
  public getFileDependencies(filePath: string): {
    dependencies: string[];
    dependents: string[];
    errors: Array<{ message: string; line: number; suggestion?: string }>;
  } {
    const dependencies = this.dependencyManager
      .getDependencies(filePath)
      .filter((dep) => dep.resolved)
      .map((dep) => dep.to);

    const dependents = this.dependencyManager.getDependents(filePath);

    const depGraph = this.dependencyManager.getDependencyGraph();
    const errors = depGraph.errors
      .filter((err) => err.file === filePath)
      .map((err) => ({
        message: err.message,
        line: err.line,
        suggestion: err.suggestion,
      }));

    return { dependencies, dependents, errors };
  }

  /**
   * Resolve import path for autocomplete/validation
   */
  public resolveImportPath(
    fromFile: string,
    importPath: string
  ): string | null {
    return this.fileProvider.resolveImportPath(fromFile, importPath);
  }

  /**
   * Get all available file paths for autocomplete
   */
  public getAvailableFiles(): string[] {
    return this.fileProvider.getAllFilePaths();
  }

  /**
   * Validate imports in a file
   */
  public validateFile(filePath: string): Array<{
    line: number;
    column: number;
    message: string;
    severity: "error" | "warning";
    suggestion?: string;
  }> {
    if (!this.diagnosticsProvider) return [];

    return this.diagnosticsProvider
      .getDiagnostics(filePath)
      .filter((err) => err.severity !== "info")
      .map((err) => ({
        line: err.line,
        column: err.column,
        message: err.message,
        severity: err.severity as "error" | "warning",
        suggestion: err.suggestion,
      }));
  }

  /**
   * Get Monaco model for a file
   */
  public getMonacoModel(filePath: string): monaco.editor.ITextModel | null {
    return this.fileProvider.getModel(filePath);
  }

  /**
   * Ensure Monaco model exists for a file
   */
  public ensureMonacoModel(filePath: string): monaco.editor.ITextModel | null {
    return this.fileProvider.ensureModel(filePath);
  }

  /**
   * Force update diagnostics for all files
   */
  public updateDiagnostics(): void {
    if (this.diagnosticsProvider) {
      this.diagnosticsProvider.updateAllDiagnostics();
    }
  }

  /**
   * Clear all caches
   */
  public clearCaches(): void {
    this.dependencyManager.clearCache();
  }

  /**
   * Get integration statistics
   */
  public getStats(): {
    totalFiles: number;
    modelsCreated: number;
    dependenciesTracked: number;
    errorsFound: number;
    warningsFound: number;
  } {
    const entries = this.vfs.getAllEntries();
    const totalFiles = Array.from(entries.values()).filter(
      (entry) => entry.type === "file"
    ).length;

    const depGraph = this.dependencyManager.getDependencyGraph();
    const dependenciesTracked = Array.from(
      depGraph.dependencies.values()
    ).flat().length;
    const errorsFound = depGraph.errors.filter(
      (err) => err.severity === "error"
    ).length;
    const warningsFound = depGraph.errors.filter(
      (err) => err.severity === "warning"
    ).length;

    return {
      totalFiles,
      modelsCreated: totalFiles, // Assuming all files have models
      dependenciesTracked,
      errorsFound,
      warningsFound,
    };
  }

  /**
   * Get VFS Store (for debugging/testing)
   */
  public getVFSStore(): VFSStore {
    return this.vfs;
  }

  /**
   * Get dependency manager (for debugging/testing)
   */
  public getDependencyManager(): DependencyManager {
    return this.dependencyManager;
  }

  /**
   * Dispose all resources
   */
  public dispose(): void {
    // Dispose Monaco providers
    this.disposables.forEach((disposable) => disposable.dispose());
    this.disposables = [];

    // Dispose diagnostics provider
    if (this.diagnosticsProvider) {
      this.diagnosticsProvider.dispose();
    }

    // Dispose file provider
    this.fileProvider.dispose();

    // Clear caches
    this.clearCaches();
  }
}
