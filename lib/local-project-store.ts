import type { DesignProject, DesignSystemSnapshot } from "@/lib/design-schema";
import { designProjectSchema, designSystemSchema } from "@/lib/design-schema-zod";
import { cloneDesignSystem, defaultDesignSystem } from "@/lib/design-systems";
import { DESIGNDOCK_SCHEMA_VERSION } from "@/lib/project-files";
import { z } from "zod";

const INDEXED_DB_NAME = "designdock-local";
const INDEXED_DB_VERSION = 1;

const STORAGE_KEYS = {
  snapshot: "designdock.localProjectsSnapshot",
  legacyCurrentProject: "designdock.currentProject",
  legacySelectedDesignSystem: "designdock.selectedDesignSystem",
};

const OBJECT_STORES = {
  projects: "projects",
  versions: "versions",
  designSystems: "designSystems",
  appSettings: "appSettings",
  exportMetadata: "exportMetadata",
};

const localProjectSnapshotSchema = z
  .object({
    schemaVersion: z.literal(DESIGNDOCK_SCHEMA_VERSION),
    projects: z.array(designProjectSchema),
    activeProjectId: z.string().min(1).nullable(),
    selectedDesignSystem: designSystemSchema,
    updatedAt: z.string().min(1),
  })
  .strict();

export type LocalProjectSnapshot = z.infer<typeof localProjectSnapshotSchema>;

export type StorageAdapterKind = "indexeddb" | "localStorage";

export type StorageHealth = {
  canRead: boolean;
  canWrite: boolean;
  canUpdate: boolean;
  canDelete: boolean;
};

export type LocalProjectStore = {
  kind: StorageAdapterKind;
  loadSnapshot: () => Promise<LocalProjectSnapshot>;
  saveSnapshot: (snapshot: LocalProjectSnapshot) => Promise<void>;
  clear: () => Promise<void>;
  runHealthCheck: () => Promise<StorageHealth>;
};

export type ProjectStoreResolution = {
  store: LocalProjectStore;
  kind: StorageAdapterKind;
  health: StorageHealth;
  warning: string | null;
};

const failingHealth: StorageHealth = {
  canRead: false,
  canWrite: false,
  canUpdate: false,
  canDelete: false,
};

function canUseStorage() {
  return typeof window !== "undefined" && "localStorage" in window;
}

function canUseIndexedDB() {
  return typeof window !== "undefined" && "indexedDB" in window;
}

function createEmptySnapshot(): LocalProjectSnapshot {
  return {
    schemaVersion: DESIGNDOCK_SCHEMA_VERSION,
    projects: [],
    activeProjectId: null,
    selectedDesignSystem: cloneDesignSystem(defaultDesignSystem),
    updatedAt: new Date().toISOString(),
  };
}

function readJson(key: string): unknown | null {
  const raw = window.localStorage.getItem(key);
  return raw ? (JSON.parse(raw) as unknown) : null;
}

function loadLegacySnapshot(): LocalProjectSnapshot | null {
  const rawProject = readJson(STORAGE_KEYS.legacyCurrentProject);
  const projectResult = designProjectSchema.safeParse(rawProject);

  if (!projectResult.success) {
    return null;
  }

  const rawDesignSystem = readJson(STORAGE_KEYS.legacySelectedDesignSystem);
  const designSystemResult = designSystemSchema.safeParse(rawDesignSystem);

  return {
    schemaVersion: DESIGNDOCK_SCHEMA_VERSION,
    projects: [projectResult.data],
    activeProjectId: projectResult.data.id,
    selectedDesignSystem: designSystemResult.success
      ? designSystemResult.data
      : cloneDesignSystem(projectResult.data.versions[0]?.spec.designSystem ?? defaultDesignSystem),
    updatedAt: new Date().toISOString(),
  };
}

function parseSnapshot(payload: unknown) {
  const result = localProjectSnapshotSchema.safeParse(payload);
  return result.success ? result.data : null;
}

function countVersions(projects: DesignProject[]) {
  return projects.reduce((total, project) => total + project.versions.length, 0);
}

export function loadLocalStorageSnapshotForMigration(): LocalProjectSnapshot | null {
  if (!canUseStorage()) return null;

  try {
    return parseSnapshot(readJson(STORAGE_KEYS.snapshot)) ?? loadLegacySnapshot();
  } catch {
    return null;
  }
}

export const localStorageProjectStore: LocalProjectStore = {
  kind: "localStorage",

  async loadSnapshot() {
    if (!canUseStorage()) return createEmptySnapshot();

    try {
      return loadLocalStorageSnapshotForMigration() ?? createEmptySnapshot();
    } catch {
      return createEmptySnapshot();
    }
  },

  async saveSnapshot(snapshot) {
    if (!canUseStorage()) {
      throw new Error("localStorage is unavailable.");
    }

    const result = localProjectSnapshotSchema.safeParse(snapshot);
    if (!result.success) {
      throw new Error("Cannot save invalid local project data.");
    }

    window.localStorage.setItem(STORAGE_KEYS.snapshot, JSON.stringify(result.data));
  },

  async clear() {
    if (!canUseStorage()) return;

    window.localStorage.removeItem(STORAGE_KEYS.snapshot);
  },

  async runHealthCheck() {
    if (!canUseStorage()) return failingHealth;

    const key = "designdock.storageHealthCheck";
    try {
      window.localStorage.setItem(key, JSON.stringify({ value: 1 }));
      const canRead = window.localStorage.getItem(key) !== null;
      window.localStorage.setItem(key, JSON.stringify({ value: 2 }));
      const canUpdate = window.localStorage.getItem(key)?.includes("2") ?? false;
      window.localStorage.removeItem(key);
      const canDelete = window.localStorage.getItem(key) === null;

      return {
        canRead,
        canWrite: true,
        canUpdate,
        canDelete,
      };
    } catch {
      return failingHealth;
    }
  },
};

export function createSnapshot(
  projects: DesignProject[],
  activeProjectId: string | null,
  selectedDesignSystem: DesignSystemSnapshot,
): LocalProjectSnapshot {
  return {
    schemaVersion: DESIGNDOCK_SCHEMA_VERSION,
    projects,
    activeProjectId,
    selectedDesignSystem,
    updatedAt: new Date().toISOString(),
  };
}

type VersionRecord = {
  id: string;
  projectId: string;
  version: DesignProject["versions"][number];
};

type DesignSystemRecord = {
  id: string;
  designSystem: DesignSystemSnapshot;
  updatedAt: string;
};

type AppSettingsRecord = {
  key: string;
  activeProjectId: string | null;
  schemaVersion: number;
  updatedAt: string;
};

type ExportMetadataRecord = {
  key: string;
  lastSavedAt: string;
  projectCount: number;
  versionCount: number;
};

function requestToPromise<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("IndexedDB request failed."));
  });
}

function transactionDone(transaction: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error ?? new Error("IndexedDB transaction failed."));
    transaction.onabort = () => reject(transaction.error ?? new Error("IndexedDB transaction aborted."));
  });
}

function openDatabase(): Promise<IDBDatabase> {
  if (!canUseIndexedDB()) {
    return Promise.reject(new Error("IndexedDB is unavailable."));
  }

  return new Promise((resolve, reject) => {
    const request = window.indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);

    request.onupgradeneeded = () => {
      const database = request.result;

      if (!database.objectStoreNames.contains(OBJECT_STORES.projects)) {
        database.createObjectStore(OBJECT_STORES.projects, { keyPath: "id" });
      }

      if (!database.objectStoreNames.contains(OBJECT_STORES.versions)) {
        const store = database.createObjectStore(OBJECT_STORES.versions, { keyPath: "id" });
        store.createIndex("projectId", "projectId", { unique: false });
      }

      if (!database.objectStoreNames.contains(OBJECT_STORES.designSystems)) {
        database.createObjectStore(OBJECT_STORES.designSystems, { keyPath: "id" });
      }

      if (!database.objectStoreNames.contains(OBJECT_STORES.appSettings)) {
        database.createObjectStore(OBJECT_STORES.appSettings, { keyPath: "key" });
      }

      if (!database.objectStoreNames.contains(OBJECT_STORES.exportMetadata)) {
        database.createObjectStore(OBJECT_STORES.exportMetadata, { keyPath: "key" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("IndexedDB failed to open."));
    request.onblocked = () => reject(new Error("IndexedDB open request was blocked."));
  });
}

async function withDatabase<T>(callback: (database: IDBDatabase) => Promise<T>): Promise<T> {
  const database = await openDatabase();

  try {
    return await callback(database);
  } finally {
    database.close();
  }
}

async function clearStore(store: IDBObjectStore) {
  await requestToPromise(store.clear());
}

export const indexedDBProjectStore: LocalProjectStore = {
  kind: "indexeddb",

  async loadSnapshot() {
    return withDatabase(async (database) => {
      const transaction = database.transaction(
        [
          OBJECT_STORES.projects,
          OBJECT_STORES.designSystems,
          OBJECT_STORES.appSettings,
        ],
        "readonly",
      );
      const projectsStore = transaction.objectStore(OBJECT_STORES.projects);
      const designSystemsStore = transaction.objectStore(OBJECT_STORES.designSystems);
      const appSettingsStore = transaction.objectStore(OBJECT_STORES.appSettings);

      const [projects, selectedRecord, settings] = await Promise.all([
        requestToPromise(projectsStore.getAll()),
        requestToPromise(designSystemsStore.get("selected")),
        requestToPromise(appSettingsStore.get("appSettings")),
      ]);
      await transactionDone(transaction);

      const parsedProjects = z.array(designProjectSchema).safeParse(projects);
      const parsedDesignSystemRecord = z
        .object({
          id: z.literal("selected"),
          designSystem: designSystemSchema,
          updatedAt: z.string().min(1),
        })
        .safeParse(selectedRecord);
      const parsedSettings = z
        .object({
          key: z.literal("appSettings"),
          activeProjectId: z.string().min(1).nullable(),
          schemaVersion: z.literal(DESIGNDOCK_SCHEMA_VERSION),
          updatedAt: z.string().min(1),
        })
        .safeParse(settings);

      const snapshot = createSnapshot(
        parsedProjects.success ? parsedProjects.data : [],
        parsedSettings.success ? parsedSettings.data.activeProjectId : null,
        parsedDesignSystemRecord.success
          ? parsedDesignSystemRecord.data.designSystem
          : cloneDesignSystem(defaultDesignSystem),
      );

      return localProjectSnapshotSchema.parse({
        ...snapshot,
        updatedAt: parsedSettings.success ? parsedSettings.data.updatedAt : snapshot.updatedAt,
      });
    });
  },

  async saveSnapshot(snapshot) {
    const result = localProjectSnapshotSchema.safeParse(snapshot);
    if (!result.success) {
      throw new Error("Cannot save invalid local project data.");
    }

    await withDatabase(async (database) => {
      const transaction = database.transaction(
        [
          OBJECT_STORES.projects,
          OBJECT_STORES.versions,
          OBJECT_STORES.designSystems,
          OBJECT_STORES.appSettings,
          OBJECT_STORES.exportMetadata,
        ],
        "readwrite",
      );
      const projectsStore = transaction.objectStore(OBJECT_STORES.projects);
      const versionsStore = transaction.objectStore(OBJECT_STORES.versions);
      const designSystemsStore = transaction.objectStore(OBJECT_STORES.designSystems);
      const appSettingsStore = transaction.objectStore(OBJECT_STORES.appSettings);
      const exportMetadataStore = transaction.objectStore(OBJECT_STORES.exportMetadata);

      await Promise.all([
        clearStore(projectsStore),
        clearStore(versionsStore),
        clearStore(designSystemsStore),
        clearStore(appSettingsStore),
        clearStore(exportMetadataStore),
      ]);

      for (const project of result.data.projects) {
        projectsStore.put(project);
        for (const version of project.versions) {
          const record: VersionRecord = {
            id: `${project.id}:${version.id}`,
            projectId: project.id,
            version,
          };
          versionsStore.put(record);
        }
      }

      const designSystemRecord: DesignSystemRecord = {
        id: "selected",
        designSystem: result.data.selectedDesignSystem,
        updatedAt: result.data.updatedAt,
      };
      const settingsRecord: AppSettingsRecord = {
        key: "appSettings",
        activeProjectId: result.data.activeProjectId,
        schemaVersion: result.data.schemaVersion,
        updatedAt: result.data.updatedAt,
      };
      const exportMetadataRecord: ExportMetadataRecord = {
        key: "lastSave",
        lastSavedAt: result.data.updatedAt,
        projectCount: result.data.projects.length,
        versionCount: countVersions(result.data.projects),
      };

      designSystemsStore.put(designSystemRecord);
      appSettingsStore.put(settingsRecord);
      exportMetadataStore.put(exportMetadataRecord);

      await transactionDone(transaction);
    });
  },

  async clear() {
    await withDatabase(async (database) => {
      const transaction = database.transaction(Object.values(OBJECT_STORES), "readwrite");
      await Promise.all(Array.from(transaction.objectStoreNames).map((name) => clearStore(transaction.objectStore(name))));
      await transactionDone(transaction);
    });
  },

  async runHealthCheck() {
    if (!canUseIndexedDB()) return failingHealth;

    return withDatabase(async (database) => {
      const key = "__healthcheck__";
      const transaction = database.transaction(OBJECT_STORES.appSettings, "readwrite");
      const store = transaction.objectStore(OBJECT_STORES.appSettings);
      const baseRecord = {
        key,
        value: 1,
        updatedAt: new Date().toISOString(),
      };

      await requestToPromise(store.put(baseRecord));
      const readRecord = await requestToPromise(store.get(key));
      await requestToPromise(store.put({ ...baseRecord, value: 2 }));
      const updatedRecord = await requestToPromise(store.get(key));
      await requestToPromise(store.delete(key));
      const deletedRecord = await requestToPromise(store.get(key));
      await transactionDone(transaction);

      return {
        canWrite: true,
        canRead: Boolean(readRecord),
        canUpdate:
          typeof updatedRecord === "object" &&
          updatedRecord !== null &&
          "value" in updatedRecord &&
          updatedRecord.value === 2,
        canDelete: deletedRecord === undefined,
      };
    }).catch(() => failingHealth);
  },
};

function healthPassed(health: StorageHealth) {
  return health.canRead && health.canWrite && health.canUpdate && health.canDelete;
}

export async function createBestProjectStore(): Promise<ProjectStoreResolution> {
  try {
    const health = await indexedDBProjectStore.runHealthCheck();

    if (healthPassed(health)) {
      return {
        store: indexedDBProjectStore,
        kind: "indexeddb",
        health,
        warning: null,
      };
    }
  } catch {
    // Fall through to localStorage fallback.
  }

  const health = await localStorageProjectStore.runHealthCheck();

  return {
    store: localStorageProjectStore,
    kind: "localStorage",
    health,
    warning: "IndexedDB is unavailable, so DesignDock is saving to localStorage.",
  };
}

export async function saveSnapshotToIndexedDB(snapshot: LocalProjectSnapshot) {
  await indexedDBProjectStore.saveSnapshot(snapshot);
}

// TODO: Add a DesktopFileProjectStore adapter if DesignDock becomes a packaged desktop app.
