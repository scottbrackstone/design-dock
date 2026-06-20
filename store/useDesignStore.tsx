"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { DesignProject, DesignSpec, DesignSystemSnapshot, Viewport } from "@/lib/design-schema";
import {
  deleteNode,
  duplicateNode,
  moveSection,
  nudgeDesignNodeSize,
  reorderSection,
  type CanvasNudgeDirection,
  type SectionDropPlacement,
} from "@/lib/design-actions";
import { designSpecSchema } from "@/lib/design-schema-zod";
import {
  cloneDesignSystem,
  defaultDesignSystem,
  getDesignSystemById,
  isHexColor,
  predefinedDesignSystems,
  type ColorTokenName,
  type RadiusTokenName,
  type TypographyTokenName,
} from "@/lib/design-systems";
import { createId } from "@/lib/ids";
import {
  createBestProjectStore,
  createSnapshot,
  loadLocalStorageSnapshotForMigration,
  localStorageProjectStore,
  saveSnapshotToIndexedDB,
  type LocalProjectStore,
  type StorageAdapterKind,
  type StorageHealth,
} from "@/lib/local-project-store";
import type { DesignDockImportFile } from "@/lib/project-files";
import {
  generateBlankDesignSpec,
  generateTemplateDesignSpec,
  getDesignTemplateById,
  type DesignTemplateId,
} from "@/lib/design-templates";
import { isAiProviderId, type AiProviderId } from "@/lib/ai/ai-provider-types";

const HISTORY_LIMIT = 80;
const AI_PROVIDER_STORAGE_KEY = "designdock.aiProviderId";

type SaveStatus = "idle" | "saving" | "saved" | "failed";
type StorageStatus = StorageAdapterKind | "unknown";

export type ProjectImportResult = {
  ok: boolean;
  message: string;
  requiresConfirmation?: boolean;
  conflictProjectNames?: string[];
};

type DesignStoreState = {
  projects: DesignProject[];
  activeProjectId: string | null;
  project: DesignProject | null;
  currentSpec: DesignSpec | null;
  designSystems: DesignSystemSnapshot[];
  selectedDesignSystem: DesignSystemSnapshot;
  pastSpecs: DesignSpec[];
  futureSpecs: DesignSpec[];
  selectedNodeId: string | null;
  hoveredNodeId: string | null;
  viewport: Viewport;
  isGenerating: boolean;
  isRefining: boolean;
  error: string | null;
  message: string | null;
  saveStatus: SaveStatus;
  storageAdapter: StorageStatus;
  storageWarning: string | null;
  storageHealth: StorageHealth | null;
  localStorageMigrationAvailable: boolean;
  isMigratingStorage: boolean;
  aiProviderId: AiProviderId;
  canUndo: boolean;
  canRedo: boolean;
};

type DesignStoreValue = DesignStoreState & {
  createNewProject: () => void;
  createProjectFromTemplate: (templateId: DesignTemplateId) => void;
  renameProject: (projectId: string, name: string) => void;
  duplicateProject: (projectId: string) => void;
  deleteProject: (projectId: string) => void;
  switchProject: (projectId: string) => void;
  migrateLocalStorageProjects: () => Promise<void>;
  runStorageHealthCheck: () => Promise<void>;
  importDesignDockFile: (file: DesignDockImportFile, overwriteConflicts?: boolean) => ProjectImportResult;
  generateDesign: (prompt: string) => Promise<void>;
  refineDesign: (instruction: string, selectedNodeId?: string) => Promise<void>;
  selectAiProvider: (providerId: AiProviderId) => void;
  selectDesignSystem: (designSystemId: string) => void;
  updateSelectedDesignSystemColor: (token: ColorTokenName, value: string) => void;
  updateSelectedDesignSystemRadius: (token: RadiusTokenName, value: number) => void;
  updateSelectedDesignSystemTypography: (token: TypographyTokenName, value: string) => void;
  selectNode: (nodeId: string) => void;
  clearSelection: () => void;
  hoverNode: (nodeId: string) => void;
  clearHover: () => void;
  updateCurrentSpec: (updater: (spec: DesignSpec) => DesignSpec) => void;
  saveVersion: (name?: string) => void;
  restoreVersion: (versionId: string) => void;
  setViewport: (viewport: Viewport) => void;
  moveSelectedSection: (direction: "up" | "down") => void;
  reorderSectionByDrop: (sectionId: string, targetSectionId: string, placement: SectionDropPlacement) => void;
  nudgeSelectedNode: (direction: CanvasNudgeDirection, largeStep?: boolean) => void;
  duplicateSelected: () => void;
  deleteSelected: () => void;
  undo: () => void;
  redo: () => void;
};

const DesignStoreContext = createContext<DesignStoreValue | null>(null);

function createVersion(spec: DesignSpec, prompt: string, name: string, refinementPrompt?: string) {
  return {
    id: createId("version"),
    name,
    createdAt: new Date().toISOString(),
    prompt,
    refinementPrompt,
    spec,
  };
}

function createProjectFromSpec(spec: DesignSpec, prompt: string, versionName = "Initial design"): DesignProject {
  const now = new Date().toISOString();
  const version = createVersion(spec, prompt, versionName);

  return {
    id: createId("project"),
    name: spec.title,
    createdAt: now,
    updatedAt: now,
    designSystemId: spec.designSystem.id,
    versions: [version],
    activeVersionId: version.id,
  };
}

function getActiveVersion(project: DesignProject | null) {
  if (!project) return null;
  return project.versions.find((version) => version.id === project.activeVersionId) ?? null;
}

function getActiveProject(projects: DesignProject[], activeProjectId: string | null) {
  return projects.find((project) => project.id === activeProjectId) ?? projects[0] ?? null;
}

function getActiveProjectId(projects: DesignProject[], activeProjectId: string | null) {
  return getActiveProject(projects, activeProjectId)?.id ?? null;
}

function getActiveEditorState(projects: DesignProject[], activeProjectId: string | null) {
  const project = getActiveProject(projects, activeProjectId);
  const activeVersion = getActiveVersion(project);

  return {
    projects,
    activeProjectId: project?.id ?? null,
    project,
    currentSpec: activeVersion?.spec ?? null,
    viewport: activeVersion?.spec.viewport ?? "desktop",
  };
}

function replaceProject(projects: DesignProject[], nextProject: DesignProject) {
  return projects.map((project) => (project.id === nextProject.id ? nextProject : project));
}

function updateActiveSpec(project: DesignProject, spec: DesignSpec): DesignProject {
  return {
    ...project,
    updatedAt: new Date().toISOString(),
    activeVersionId: project.activeVersionId,
    versions: project.versions.map((version) =>
      version.id === project.activeVersionId ? { ...version, spec } : version,
    ),
  };
}

function createDesignSystemList() {
  return predefinedDesignSystems.map(cloneDesignSystem);
}

function hasProjectsToMigrate(sourceProjects: DesignProject[], targetProjects: DesignProject[]) {
  const targetIds = new Set(targetProjects.map((project) => project.id));
  return sourceProjects.some((project) => !targetIds.has(project.id));
}

function cloneProjectAsCopy(project: DesignProject): DesignProject {
  const now = new Date().toISOString();
  const activeVersionIndex = Math.max(
    project.versions.findIndex((version) => version.id === project.activeVersionId),
    0,
  );
  const versions = project.versions.map((version) => ({
    ...structuredClone(version),
    id: createId("version"),
    createdAt: now,
  }));

  return {
    ...structuredClone(project),
    id: createId("project"),
    name: `${project.name} copy`,
    createdAt: now,
    updatedAt: now,
    versions,
    activeVersionId: versions[activeVersionIndex]?.id ?? versions[0]?.id ?? createId("version"),
  };
}

function readStoredAiProviderId(): AiProviderId {
  if (typeof window === "undefined") return "mock";

  const stored = window.localStorage.getItem(AI_PROVIDER_STORAGE_KEY);
  return isAiProviderId(stored) ? stored : "mock";
}

function saveStoredAiProviderId(providerId: AiProviderId) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(AI_PROVIDER_STORAGE_KEY, providerId);
}

async function readSpecResponse(response: Response) {
  const payload = (await response.json()) as {
    spec?: unknown;
    error?: string;
    warning?: string;
    summary?: string;
  };

  if (!response.ok) {
    throw new Error(payload.error ?? "Request failed.");
  }

  const spec = designSpecSchema.parse(payload.spec);
  return { spec, message: payload.warning ?? payload.summary ?? null };
}

export function DesignStoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<DesignStoreState>({
    projects: [],
    activeProjectId: null,
    project: null,
    currentSpec: null,
    designSystems: createDesignSystemList(),
    selectedDesignSystem: cloneDesignSystem(defaultDesignSystem),
    pastSpecs: [],
    futureSpecs: [],
    selectedNodeId: null,
    hoveredNodeId: null,
    viewport: "desktop",
    isGenerating: false,
    isRefining: false,
    error: null,
    message: null,
    saveStatus: "idle",
    storageAdapter: "unknown",
    storageWarning: null,
    storageHealth: null,
    localStorageMigrationAvailable: false,
    isMigratingStorage: false,
    aiProviderId: "mock",
    canUndo: false,
    canRedo: false,
  });
  const hasHydratedRef = useRef(false);
  const autosaveTimerRef = useRef<number | null>(null);
  const projectStoreRef = useRef<LocalProjectStore | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function hydrate() {
      try {
        const resolution = await createBestProjectStore();
        const snapshot = await resolution.store.loadSnapshot();
        const localStorageSnapshot = loadLocalStorageSnapshotForMigration();
        const migrationAvailable =
          resolution.kind === "indexeddb" &&
          Boolean(localStorageSnapshot?.projects.length) &&
          hasProjectsToMigrate(localStorageSnapshot?.projects ?? [], snapshot.projects);
        const activeProjectId = getActiveProjectId(snapshot.projects, snapshot.activeProjectId);

        if (cancelled) return;

        projectStoreRef.current = resolution.store;
        setState((current) => ({
          ...current,
          ...getActiveEditorState(snapshot.projects, activeProjectId),
          selectedDesignSystem: cloneDesignSystem(snapshot.selectedDesignSystem),
          pastSpecs: [],
          futureSpecs: [],
          canUndo: false,
          canRedo: false,
          saveStatus: snapshot.projects.length > 0 ? "saved" : "idle",
          storageAdapter: resolution.kind,
          storageWarning: resolution.warning,
          storageHealth: resolution.health,
          localStorageMigrationAvailable: migrationAvailable,
          aiProviderId: readStoredAiProviderId(),
        }));
      } catch {
        const fallbackSnapshot = await localStorageProjectStore.loadSnapshot();
        const activeProjectId = getActiveProjectId(fallbackSnapshot.projects, fallbackSnapshot.activeProjectId);
        const health = await localStorageProjectStore.runHealthCheck();

        if (cancelled) return;

        projectStoreRef.current = localStorageProjectStore;
        setState((current) => ({
          ...current,
          ...getActiveEditorState(fallbackSnapshot.projects, activeProjectId),
          selectedDesignSystem: cloneDesignSystem(fallbackSnapshot.selectedDesignSystem),
          pastSpecs: [],
          futureSpecs: [],
          canUndo: false,
          canRedo: false,
          saveStatus: fallbackSnapshot.projects.length > 0 ? "saved" : "idle",
          storageAdapter: "localStorage",
          storageWarning: "IndexedDB failed to load, so DesignDock is saving to localStorage.",
          storageHealth: health,
          localStorageMigrationAvailable: false,
          aiProviderId: readStoredAiProviderId(),
        }));
      } finally {
        hasHydratedRef.current = true;
      }
    }

    void hydrate();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!hasHydratedRef.current) return;

    setState((current) => (current.saveStatus === "saving" ? current : { ...current, saveStatus: "saving" }));

    if (autosaveTimerRef.current) {
      window.clearTimeout(autosaveTimerRef.current);
    }

    autosaveTimerRef.current = window.setTimeout(() => {
      const store = projectStoreRef.current;
      if (!store) return;

      void (async () => {
      try {
        await store.saveSnapshot(
          createSnapshot(state.projects, state.activeProjectId, state.selectedDesignSystem),
        );
        setState((current) => ({ ...current, saveStatus: "saved", error: null }));
      } catch {
        setState((current) => ({
          ...current,
          saveStatus: "failed",
          error: "Save failed. Your current changes are still in memory.",
        }));
      }
      })();
    }, 650);

    return () => {
      if (autosaveTimerRef.current) {
        window.clearTimeout(autosaveTimerRef.current);
      }
    };
  }, [state.activeProjectId, state.projects, state.selectedDesignSystem]);

  function buildHistoryState(pastSpecs: DesignSpec[], futureSpecs: DesignSpec[]) {
    return {
      pastSpecs,
      futureSpecs,
      canUndo: pastSpecs.length > 0,
      canRedo: futureSpecs.length > 0,
    };
  }

  function pushHistory(pastSpecs: DesignSpec[], spec: DesignSpec) {
    return [...pastSpecs, spec].slice(-HISTORY_LIMIT);
  }

  const updateCurrentSpec = useCallback(
    (updater: (spec: DesignSpec) => DesignSpec) => {
      setState((current) => {
        if (!current.currentSpec || !current.project) return current;

        const nextSpec = updater(current.currentSpec);
        if (nextSpec === current.currentSpec) return current;

        const nextProject = updateActiveSpec(current.project, nextSpec);
        const history = buildHistoryState(pushHistory(current.pastSpecs, current.currentSpec), []);

        return {
          ...current,
          projects: replaceProject(current.projects, nextProject),
          project: nextProject,
          currentSpec: nextSpec,
          ...history,
          viewport: nextSpec.viewport,
          message: "Updated locally.",
          error: null,
        };
      });
    },
    [],
  );

  const createNewProject = useCallback(() => {
    setState((current) => {
      const spec = designSpecSchema.parse(generateBlankDesignSpec(current.selectedDesignSystem));
      const project = {
        ...createProjectFromSpec(spec, "Blank project", "Blank starter"),
        name: "Untitled project",
      };

      return {
        ...current,
        projects: [...current.projects, project],
        activeProjectId: project.id,
        project,
        currentSpec: spec,
        pastSpecs: [],
        futureSpecs: [],
        canUndo: false,
        canRedo: false,
        selectedNodeId: null,
        hoveredNodeId: null,
        viewport: spec.viewport,
        message: "Created a new local project.",
        error: null,
      };
    });
  }, []);

  const createProjectFromTemplate = useCallback((templateId: DesignTemplateId) => {
    setState((current) => {
      const template = getDesignTemplateById(templateId);
      const spec = designSpecSchema.parse(generateTemplateDesignSpec(templateId, current.selectedDesignSystem));
      const project = createProjectFromSpec(spec, template.prompt, `Template: ${template.name}`);

      return {
        ...current,
        projects: [...current.projects, project],
        activeProjectId: project.id,
        project,
        currentSpec: spec,
        pastSpecs: [],
        futureSpecs: [],
        canUndo: false,
        canRedo: false,
        selectedNodeId: null,
        hoveredNodeId: null,
        viewport: spec.viewport,
        message: `Started from ${template.name}.`,
        error: null,
      };
    });
  }, []);

  const renameProject = useCallback((projectId: string, name: string) => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      setState((current) => ({ ...current, error: "Project name cannot be empty." }));
      return;
    }

    setState((current) => {
      const projects = current.projects.map((project) =>
        project.id === projectId ? { ...project, name: trimmedName, updatedAt: new Date().toISOString() } : project,
      );
      const activeState = getActiveEditorState(projects, current.activeProjectId);

      return {
        ...current,
        ...activeState,
        message: "Renamed project.",
        error: null,
      };
    });
  }, []);

  const duplicateProject = useCallback((projectId: string) => {
    setState((current) => {
      const project = current.projects.find((item) => item.id === projectId);
      if (!project) return current;

      const copy = cloneProjectAsCopy(project);
      const activeState = getActiveEditorState([...current.projects, copy], copy.id);

      return {
        ...current,
        ...activeState,
        pastSpecs: [],
        futureSpecs: [],
        canUndo: false,
        canRedo: false,
        selectedNodeId: null,
        hoveredNodeId: null,
        message: "Duplicated project.",
        error: null,
      };
    });
  }, []);

  const deleteProject = useCallback((projectId: string) => {
    setState((current) => {
      const projects = current.projects.filter((project) => project.id !== projectId);
      const activeProjectId = current.activeProjectId === projectId ? projects[0]?.id ?? null : current.activeProjectId;
      const activeState = getActiveEditorState(projects, activeProjectId);

      return {
        ...current,
        ...activeState,
        pastSpecs: [],
        futureSpecs: [],
        canUndo: false,
        canRedo: false,
        selectedNodeId: null,
        hoveredNodeId: null,
        message: projects.length > 0 ? "Deleted project." : "Deleted project. No local projects remain.",
        error: null,
      };
    });
  }, []);

  const switchProject = useCallback((projectId: string) => {
    setState((current) => {
      const project = current.projects.find((item) => item.id === projectId);
      if (!project) return current;

      return {
        ...current,
        ...getActiveEditorState(current.projects, project.id),
        pastSpecs: [],
        futureSpecs: [],
        canUndo: false,
        canRedo: false,
        selectedNodeId: null,
        hoveredNodeId: null,
        message: `Switched to ${project.name}.`,
        error: null,
      };
    });
  }, []);

  const migrateLocalStorageProjects = useCallback(async () => {
    if (projectStoreRef.current?.kind !== "indexeddb") {
      setState((current) => ({
        ...current,
        storageWarning: "Migration is only available when IndexedDB is active.",
      }));
      return;
    }

    const localStorageSnapshot = loadLocalStorageSnapshotForMigration();
    if (!localStorageSnapshot || localStorageSnapshot.projects.length === 0) {
      setState((current) => ({
        ...current,
        localStorageMigrationAvailable: false,
        message: "No localStorage projects were found to migrate.",
      }));
      return;
    }

    const existingIds = new Set(state.projects.map((project) => project.id));
    const projectsToAdd = localStorageSnapshot.projects.filter((project) => !existingIds.has(project.id));
    if (projectsToAdd.length === 0) {
      setState((current) => ({
        ...current,
        localStorageMigrationAvailable: false,
        message: "localStorage projects are already in IndexedDB.",
      }));
      return;
    }

    const projects = [...state.projects, ...projectsToAdd];
    const activeProjectId = state.activeProjectId ?? localStorageSnapshot.activeProjectId ?? projects[0]?.id ?? null;
    const selectedDesignSystem =
      state.projects.length > 0 ? state.selectedDesignSystem : localStorageSnapshot.selectedDesignSystem;
    const snapshot = createSnapshot(projects, activeProjectId, selectedDesignSystem);

    setState((current) => ({
      ...current,
      isMigratingStorage: true,
      message: "Migrating localStorage projects to IndexedDB.",
      error: null,
    }));

    try {
      await saveSnapshotToIndexedDB(snapshot);
      setState((current) => ({
        ...current,
        ...getActiveEditorState(projects, activeProjectId),
        selectedDesignSystem,
        isMigratingStorage: false,
        localStorageMigrationAvailable: false,
        saveStatus: "saved",
        message: `Migrated ${projectsToAdd.length} localStorage project${projectsToAdd.length === 1 ? "" : "s"} to IndexedDB.`,
        error: null,
      }));
    } catch {
      setState((current) => ({
        ...current,
        isMigratingStorage: false,
        error: "Migration failed. localStorage data was not deleted.",
      }));
    }
  }, [state.activeProjectId, state.projects, state.selectedDesignSystem]);

  const runStorageHealthCheck = useCallback(async () => {
    const store = projectStoreRef.current;
    if (!store) return;

    const health = await store.runHealthCheck();
    setState((current) => ({
      ...current,
      storageHealth: health,
      storageWarning:
        store.kind === "localStorage"
          ? "IndexedDB is unavailable, so DesignDock is saving to localStorage."
          : current.storageWarning,
      message: "Storage health check complete.",
    }));
  }, []);

  const importDesignDockFile = useCallback((file: DesignDockImportFile, overwriteConflicts = false) => {
    let result: ProjectImportResult = {
      ok: false,
      message: "Import failed.",
    };

    setState((current) => {
      const importedProjects = file.kind === "designdock-project" ? [file.project] : file.projects;
      const importedIds = new Set(importedProjects.map((project) => project.id));
      const conflicts = current.projects.filter((project) => importedIds.has(project.id));

      if (conflicts.length > 0 && !overwriteConflicts) {
        result = {
          ok: false,
          requiresConfirmation: true,
          conflictProjectNames: conflicts.map((project) => project.name),
          message: "Import includes projects already saved locally.",
        };
        return current;
      }

      const projectsWithoutConflicts = current.projects.filter((project) => !importedIds.has(project.id));
      const projects = [...projectsWithoutConflicts, ...importedProjects];
      const preferredActiveProjectId =
        file.kind === "designdock-project" ? file.project.id : file.activeProjectId ?? importedProjects[0]?.id ?? null;
      const activeState = getActiveEditorState(projects, preferredActiveProjectId);
      const selectedDesignSystem = cloneDesignSystem(file.selectedDesignSystem);

      result = {
        ok: true,
        message:
          importedProjects.length === 1
            ? `Imported ${importedProjects[0].name}.`
            : `Imported ${importedProjects.length} projects.`,
      };

      return {
        ...current,
        ...activeState,
        selectedDesignSystem,
        pastSpecs: [],
        futureSpecs: [],
        canUndo: false,
        canRedo: false,
        selectedNodeId: null,
        hoveredNodeId: null,
        message: result.message,
        error: null,
      };
    });

    return result;
  }, []);

  const generateDesign = useCallback(
    async (prompt: string) => {
      const trimmedPrompt = prompt.trim();
      if (!trimmedPrompt) {
        setState((current) => ({ ...current, error: "Enter a prompt first." }));
        return;
      }

      setState((current) => ({ ...current, isGenerating: true, error: null, message: null }));

      try {
        const response = await fetch("/api/generate-design", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: trimmedPrompt,
            designSystem: state.selectedDesignSystem,
            providerId: state.aiProviderId,
          }),
        });
        const { spec, message } = await readSpecResponse(response);
        const project = createProjectFromSpec(spec, trimmedPrompt);

        setState((current) => ({
          ...current,
          projects: [...current.projects, project],
          activeProjectId: project.id,
          project,
          currentSpec: spec,
          pastSpecs: [],
          futureSpecs: [],
          canUndo: false,
          canRedo: false,
          selectedNodeId: null,
          hoveredNodeId: null,
          viewport: spec.viewport,
          isGenerating: false,
          error: null,
          message: message ?? "Generated a new DesignSpec.",
        }));
      } catch (error) {
        setState((current) => ({
          ...current,
          isGenerating: false,
          error: error instanceof Error ? error.message : "Generation failed.",
        }));
      }
    },
    [state.aiProviderId, state.selectedDesignSystem],
  );

  const refineDesign = useCallback(
    async (instruction: string, selectedNodeId?: string) => {
      const trimmedInstruction = instruction.trim();
      if (!trimmedInstruction) {
        setState((current) => ({ ...current, error: "Enter a refinement instruction first." }));
        return;
      }

      if (!state.currentSpec || !state.project) {
        setState((current) => ({ ...current, error: "Generate a design before refining." }));
        return;
      }

      setState((current) => ({ ...current, isRefining: true, error: null, message: null }));

      try {
        const response = await fetch("/api/refine-design", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            instruction: trimmedInstruction,
            currentSpec: state.currentSpec,
            selectedNodeId,
          }),
        });
        const { spec, message } = await readSpecResponse(response);
        const activeVersion = getActiveVersion(state.project);
        const version = createVersion(
          spec,
          activeVersion?.prompt ?? state.currentSpec.description,
          selectedNodeId ? "Selected-node refinement" : "Whole-design refinement",
          trimmedInstruction,
        );
        const project: DesignProject = {
          ...state.project,
          updatedAt: new Date().toISOString(),
          versions: [...state.project.versions, version],
          activeVersionId: version.id,
        };

        setState((current) => ({
          ...current,
          projects: replaceProject(current.projects, project),
          project,
          currentSpec: spec,
          pastSpecs: [],
          futureSpecs: [],
          canUndo: false,
          canRedo: false,
          selectedNodeId: selectedNodeId ?? null,
          hoveredNodeId: null,
          viewport: spec.viewport,
          isRefining: false,
          error: null,
          message: message ?? "Refinement applied.",
        }));
      } catch (error) {
        setState((current) => ({
          ...current,
          isRefining: false,
          error: error instanceof Error ? error.message : "Refinement failed.",
        }));
      }
    },
    [state.currentSpec, state.project],
  );

  const selectAiProvider = useCallback((providerId: AiProviderId) => {
    saveStoredAiProviderId(providerId);
    setState((current) => ({
      ...current,
      aiProviderId: providerId,
      message: `${providerId === "mock" ? "Mock" : providerId === "deepseek" ? "DeepSeek" : "MiniMax"} selected.`,
      error: null,
    }));
  }, []);

  const saveVersion = useCallback(
    (name?: string) => {
      setState((current) => {
        if (!current.currentSpec || !current.project) return current;

        const activeVersion = getActiveVersion(current.project);
        const version = createVersion(
          current.currentSpec,
          activeVersion?.prompt ?? current.currentSpec.description,
          name?.trim() || `Version ${current.project.versions.length + 1}`,
        );
        const nextProject: DesignProject = {
          ...current.project,
          updatedAt: new Date().toISOString(),
          versions: [...current.project.versions, version],
          activeVersionId: version.id,
        };

        return {
          ...current,
          projects: replaceProject(current.projects, nextProject),
          project: nextProject,
          message: "Saved a new version.",
          error: null,
        };
      });
    },
    [],
  );

  const restoreVersion = useCallback(
    (versionId: string) => {
      setState((current) => {
        if (!current.project) return current;

        const version = current.project.versions.find((item) => item.id === versionId);
        if (!version) return current;

        const nextProject = {
          ...current.project,
          updatedAt: new Date().toISOString(),
          activeVersionId: version.id,
        };

        return {
          ...current,
          projects: replaceProject(current.projects, nextProject),
          project: nextProject,
          currentSpec: version.spec,
          pastSpecs: [],
          futureSpecs: [],
          canUndo: false,
          canRedo: false,
          selectedNodeId: null,
          hoveredNodeId: null,
          viewport: version.spec.viewport,
          message: `Restored ${version.name}.`,
          error: null,
        };
      });
    },
    [],
  );

  const setViewport = useCallback(
    (viewport: Viewport) => {
      updateCurrentSpec((spec) => (spec.viewport === viewport ? spec : { ...spec, viewport }));
    },
    [updateCurrentSpec],
  );

  const selectDesignSystem = useCallback((designSystemId: string) => {
    const selectedDesignSystem = getDesignSystemById(designSystemId);
    setState((current) => ({
      ...current,
      selectedDesignSystem,
      message: `${selectedDesignSystem.name} selected.`,
      error: null,
    }));
  }, []);

  const updateSelectedDesignSystem = useCallback(
    (updater: (designSystem: DesignSystemSnapshot) => DesignSystemSnapshot, message: string) => {
      setState((current) => {
        const selectedDesignSystem = updater(current.selectedDesignSystem);

        return {
          ...current,
          selectedDesignSystem,
          message,
          error: null,
        };
      });
    },
    [],
  );

  const updateSelectedDesignSystemColor = useCallback(
    (token: ColorTokenName, value: string) => {
      if (!isHexColor(value)) return;

      updateSelectedDesignSystem(
        (designSystem) => ({
          ...designSystem,
          tokens: {
            ...designSystem.tokens,
            colors: {
              ...designSystem.tokens.colors,
              [token]: value,
            },
          },
        }),
        "Updated design system colours.",
      );
    },
    [updateSelectedDesignSystem],
  );

  const updateSelectedDesignSystemRadius = useCallback(
    (token: RadiusTokenName, value: number) => {
      const max = token === "full" ? 999 : token === "xl" ? 160 : token === "lg" ? 120 : 80;
      const safeValue = Math.min(Math.max(Number.isFinite(value) ? value : 0, 0), max);

      updateSelectedDesignSystem(
        (designSystem) => ({
          ...designSystem,
          tokens: {
            ...designSystem.tokens,
            radius: {
              ...designSystem.tokens.radius,
              [token]: safeValue,
            },
          },
        }),
        "Updated design system radius.",
      );
    },
    [updateSelectedDesignSystem],
  );

  const updateSelectedDesignSystemTypography = useCallback(
    (token: TypographyTokenName, value: string) => {
      const safeValue = value.trim();
      if (!safeValue) return;

      updateSelectedDesignSystem(
        (designSystem) => ({
          ...designSystem,
          tokens: {
            ...designSystem.tokens,
            typography: {
              ...designSystem.tokens.typography,
              [token]: safeValue,
            },
          },
        }),
        "Updated design system fonts.",
      );
    },
    [updateSelectedDesignSystem],
  );

  const selectNode = useCallback((nodeId: string) => {
    setState((current) => ({ ...current, selectedNodeId: nodeId, hoveredNodeId: nodeId }));
  }, []);

  const clearSelection = useCallback(() => {
    setState((current) => ({ ...current, selectedNodeId: null }));
  }, []);

  const hoverNode = useCallback((nodeId: string) => {
    setState((current) => (current.hoveredNodeId === nodeId ? current : { ...current, hoveredNodeId: nodeId }));
  }, []);

  const clearHover = useCallback(() => {
    setState((current) => (current.hoveredNodeId === null ? current : { ...current, hoveredNodeId: null }));
  }, []);

  const moveSelectedSection = useCallback(
    (direction: "up" | "down") => {
      if (!state.selectedNodeId) return;
      updateCurrentSpec((spec) => moveSection(spec, state.selectedNodeId ?? "", direction));
    },
    [state.selectedNodeId, updateCurrentSpec],
  );

  const reorderSectionByDrop = useCallback(
    (sectionId: string, targetSectionId: string, placement: SectionDropPlacement) => {
      updateCurrentSpec((spec) => reorderSection(spec, sectionId, targetSectionId, placement));
    },
    [updateCurrentSpec],
  );

  const nudgeSelectedNode = useCallback(
    (direction: CanvasNudgeDirection, largeStep = false) => {
      if (!state.selectedNodeId) return;

      updateCurrentSpec((spec) => {
        const selectedId = state.selectedNodeId ?? "";
        const selectedSection = spec.page.sections.some((section) => section.id === selectedId);

        if (selectedSection && (direction === "up" || direction === "down")) {
          return moveSection(spec, selectedId, direction);
        }

        return nudgeDesignNodeSize(spec, selectedId, state.viewport, direction, largeStep);
      });
    },
    [state.selectedNodeId, state.viewport, updateCurrentSpec],
  );

  const duplicateSelected = useCallback(() => {
    setState((current) => {
      if (!current.currentSpec || !current.project || !current.selectedNodeId) return current;

      const result = duplicateNode(current.currentSpec, current.selectedNodeId);
      if (result.spec === current.currentSpec) return current;

      const nextProject = updateActiveSpec(current.project, result.spec);
      const history = buildHistoryState(pushHistory(current.pastSpecs, current.currentSpec), []);

      return {
        ...current,
        projects: replaceProject(current.projects, nextProject),
        project: nextProject,
        currentSpec: result.spec,
        ...history,
        selectedNodeId: result.newNodeId ?? current.selectedNodeId,
        hoveredNodeId: result.newNodeId ?? current.hoveredNodeId,
        message: result.newNodeId ? "Duplicated selected node." : current.message,
        error: null,
      };
    });
  }, []);

  const deleteSelected = useCallback(() => {
    setState((current) => {
      if (!current.currentSpec || !current.project || !current.selectedNodeId) return current;

      const result = deleteNode(current.currentSpec, current.selectedNodeId);
      if (result.spec === current.currentSpec) return current;

      const nextProject = updateActiveSpec(current.project, result.spec);
      const history = buildHistoryState(pushHistory(current.pastSpecs, current.currentSpec), []);

      return {
        ...current,
        projects: replaceProject(current.projects, nextProject),
        project: nextProject,
        currentSpec: result.spec,
        ...history,
        selectedNodeId: result.deleted ? null : current.selectedNodeId,
        hoveredNodeId: result.deleted ? null : current.hoveredNodeId,
        message: result.deleted ? "Deleted selected node." : "Could not delete that node.",
        error: null,
      };
    });
  }, []);

  const undo = useCallback(() => {
    setState((current) => {
      if (!current.currentSpec || !current.project || current.pastSpecs.length === 0) return current;

      const previousSpec = current.pastSpecs[current.pastSpecs.length - 1];
      const pastSpecs = current.pastSpecs.slice(0, -1);
      const futureSpecs = [current.currentSpec, ...current.futureSpecs].slice(0, HISTORY_LIMIT);
      const nextProject = updateActiveSpec(current.project, previousSpec);

      return {
        ...current,
        projects: replaceProject(current.projects, nextProject),
        project: nextProject,
        currentSpec: previousSpec,
        ...buildHistoryState(pastSpecs, futureSpecs),
        selectedNodeId: null,
        hoveredNodeId: null,
        viewport: previousSpec.viewport,
        message: "Undid local edit.",
        error: null,
      };
    });
  }, []);

  const redo = useCallback(() => {
    setState((current) => {
      if (!current.currentSpec || !current.project || current.futureSpecs.length === 0) return current;

      const nextSpec = current.futureSpecs[0];
      const futureSpecs = current.futureSpecs.slice(1);
      const pastSpecs = pushHistory(current.pastSpecs, current.currentSpec);
      const nextProject = updateActiveSpec(current.project, nextSpec);

      return {
        ...current,
        projects: replaceProject(current.projects, nextProject),
        project: nextProject,
        currentSpec: nextSpec,
        ...buildHistoryState(pastSpecs, futureSpecs),
        selectedNodeId: null,
        hoveredNodeId: null,
        viewport: nextSpec.viewport,
        message: "Redid local edit.",
        error: null,
      };
    });
  }, []);

  const value = useMemo<DesignStoreValue>(
    () => ({
      ...state,
      createNewProject,
      createProjectFromTemplate,
      renameProject,
      duplicateProject,
      deleteProject,
      switchProject,
      migrateLocalStorageProjects,
      runStorageHealthCheck,
      importDesignDockFile,
      generateDesign,
      refineDesign,
      selectAiProvider,
      selectDesignSystem,
      updateSelectedDesignSystemColor,
      updateSelectedDesignSystemRadius,
      updateSelectedDesignSystemTypography,
      selectNode,
      clearSelection,
      hoverNode,
      clearHover,
      updateCurrentSpec,
      saveVersion,
      restoreVersion,
      setViewport,
      moveSelectedSection,
      reorderSectionByDrop,
      nudgeSelectedNode,
      duplicateSelected,
      deleteSelected,
      undo,
      redo,
    }),
    [
      state,
      createNewProject,
      createProjectFromTemplate,
      renameProject,
      duplicateProject,
      deleteProject,
      switchProject,
      migrateLocalStorageProjects,
      runStorageHealthCheck,
      importDesignDockFile,
      generateDesign,
      refineDesign,
      selectAiProvider,
      selectDesignSystem,
      updateSelectedDesignSystemColor,
      updateSelectedDesignSystemRadius,
      updateSelectedDesignSystemTypography,
      selectNode,
      clearSelection,
      hoverNode,
      clearHover,
      updateCurrentSpec,
      saveVersion,
      restoreVersion,
      setViewport,
      moveSelectedSection,
      reorderSectionByDrop,
      nudgeSelectedNode,
      duplicateSelected,
      deleteSelected,
      undo,
      redo,
    ],
  );

  return <DesignStoreContext.Provider value={value}>{children}</DesignStoreContext.Provider>;
}

export function useDesignStore() {
  const context = useContext(DesignStoreContext);

  if (!context) {
    throw new Error("useDesignStore must be used inside DesignStoreProvider.");
  }

  return context;
}
