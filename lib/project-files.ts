import { z } from "zod";
import type { DesignProject, DesignSystemSnapshot } from "@/lib/design-schema";
import { designProjectSchema, designSystemSchema } from "@/lib/design-schema-zod";

export const DESIGNDOCK_SCHEMA_VERSION = 1;
export const DESIGNDOCK_EXPORT_VERSION = "1";
export const DESIGNDOCK_APP_VERSION = "0.1.0";

const exportMetadataSchema = z
  .object({
    exportedAt: z.string().min(1),
    source: z.literal("DesignDock"),
    projectCount: z.number().int().min(0).optional(),
  })
  .strict();

export const projectExportFileSchema = z
  .object({
    kind: z.literal("designdock-project"),
    schemaVersion: z.literal(DESIGNDOCK_SCHEMA_VERSION),
    exportVersion: z.string().min(1),
    appVersion: z.string().min(1),
    metadata: exportMetadataSchema,
    project: designProjectSchema,
    activeProjectId: z.string().min(1),
    selectedDesignSystem: designSystemSchema,
  })
  .strict();

export const backupExportFileSchema = z
  .object({
    kind: z.literal("designdock-backup"),
    schemaVersion: z.literal(DESIGNDOCK_SCHEMA_VERSION),
    exportVersion: z.string().min(1),
    appVersion: z.string().min(1),
    metadata: exportMetadataSchema.extend({
      projectCount: z.number().int().min(0),
    }),
    projects: z.array(designProjectSchema),
    activeProjectId: z.string().min(1).nullable(),
    selectedDesignSystem: designSystemSchema,
  })
  .strict();

const importFileSchema = z.union([projectExportFileSchema, backupExportFileSchema]);

export type ProjectExportFile = z.infer<typeof projectExportFileSchema>;
export type BackupExportFile = z.infer<typeof backupExportFileSchema>;
export type DesignDockImportFile = ProjectExportFile | BackupExportFile;

type ProjectSnapshot = {
  projects: DesignProject[];
  activeProjectId: string | null;
  selectedDesignSystem: DesignSystemSnapshot;
};

function createMetadata(projectCount?: number) {
  const metadata = {
    exportedAt: new Date().toISOString(),
    source: "DesignDock" as const,
  };

  return typeof projectCount === "number" ? { ...metadata, projectCount } : metadata;
}

export function createProjectExportFile(
  project: DesignProject,
  selectedDesignSystem: DesignSystemSnapshot,
): ProjectExportFile {
  return {
    kind: "designdock-project",
    schemaVersion: DESIGNDOCK_SCHEMA_VERSION,
    exportVersion: DESIGNDOCK_EXPORT_VERSION,
    appVersion: DESIGNDOCK_APP_VERSION,
    metadata: createMetadata(1),
    project,
    activeProjectId: project.id,
    selectedDesignSystem,
  };
}

export function createBackupExportFile(snapshot: ProjectSnapshot): BackupExportFile {
  return {
    kind: "designdock-backup",
    schemaVersion: DESIGNDOCK_SCHEMA_VERSION,
    exportVersion: DESIGNDOCK_EXPORT_VERSION,
    appVersion: DESIGNDOCK_APP_VERSION,
    metadata: { ...createMetadata(), projectCount: snapshot.projects.length },
    projects: snapshot.projects,
    activeProjectId: snapshot.activeProjectId,
    selectedDesignSystem: snapshot.selectedDesignSystem,
  };
}

export function stringifyProjectFile(file: DesignDockImportFile) {
  return JSON.stringify(file, null, 2);
}

export function parseJsonFileContent(content: string): unknown {
  try {
    return JSON.parse(content) as unknown;
  } catch {
    throw new Error("That file is not valid JSON.");
  }
}

export function migrateImportPayload(payload: unknown): unknown {
  if (typeof payload !== "object" || payload === null) {
    throw new Error("That file does not look like a DesignDock export.");
  }

  const schemaVersion = "schemaVersion" in payload ? payload.schemaVersion : undefined;
  if (schemaVersion === DESIGNDOCK_SCHEMA_VERSION) {
    return payload;
  }

  throw new Error("This DesignDock export uses an unsupported schema version.");
}

export function parseDesignDockImportFile(payload: unknown): DesignDockImportFile {
  const migrated = migrateImportPayload(payload);
  const result = importFileSchema.safeParse(migrated);

  if (!result.success) {
    throw new Error("That file is not a valid DesignDock project or backup.");
  }

  return result.data;
}

export function slugifyFilename(value: string) {
  const slug = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug || "designdock-project";
}

export function getImportProjectIds(file: DesignDockImportFile) {
  return file.kind === "designdock-project" ? [file.project.id] : file.projects.map((project) => project.id);
}
