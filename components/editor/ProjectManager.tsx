"use client";

import { useRef, useState } from "react";
import { SelectControl } from "@/components/inspector/SelectControl";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import type { DesignProject } from "@/lib/design-schema";
import {
  createBackupExportFile,
  createProjectExportFile,
  parseDesignDockImportFile,
  parseJsonFileContent,
  slugifyFilename,
  stringifyProjectFile,
} from "@/lib/project-files";
import { cx } from "@/lib/tailwind-utils";
import { useDesignStore } from "@/store/useDesignStore";

function downloadJsonFile(filename: string, content: string) {
  const blob = new Blob([content], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function saveStatusLabel(status: "idle" | "saving" | "saved" | "failed") {
  if (status === "saving") return "Saving...";
  if (status === "saved") return "Saved locally";
  if (status === "failed") return "Save failed";
  return "Local project";
}

function healthLabel(value: boolean) {
  return value ? "OK" : "Fail";
}

function ProjectRenameForm({
  project,
  onRename,
}: {
  project: DesignProject | null;
  onRename: (name: string) => void;
}) {
  const [name, setName] = useState(project?.name ?? "");

  return (
    <div className="space-y-2">
      <label className="block text-xs font-bold uppercase text-zinc-500" htmlFor="project-name">
        Project name
      </label>
      <div className="flex gap-2">
        <Input
          disabled={!project}
          id="project-name"
          onChange={(event) => setName(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") onRename(name);
          }}
          placeholder="Untitled project"
          value={name}
        />
        <Button disabled={!project || !name.trim()} onClick={() => onRename(name)}>
          Rename
        </Button>
      </div>
    </div>
  );
}

export function ProjectManager() {
  const [importMessage, setImportMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const {
    activeProjectId,
    createNewProject,
    deleteProject,
    duplicateProject,
    importDesignDockFile,
    isMigratingStorage,
    localStorageMigrationAvailable,
    migrateLocalStorageProjects,
    project,
    projects,
    renameProject,
    runStorageHealthCheck,
    saveStatus,
    selectedDesignSystem,
    storageAdapter,
    storageHealth,
    storageWarning,
    switchProject,
  } = useDesignStore();
  const projectOptions = projects.map((item) => ({ value: item.id, label: item.name }));

  function handleRename(name: string) {
    if (!project) return;
    renameProject(project.id, name);
  }

  function handleDelete() {
    if (!project) return;

    const confirmed = window.confirm(`Delete "${project.name}" from local storage? This cannot be undone.`);
    if (confirmed) {
      deleteProject(project.id);
    }
  }

  function handleExportProject() {
    if (!project) return;

    const file = createProjectExportFile(project, selectedDesignSystem);
    downloadJsonFile(`${slugifyFilename(project.name)}.designdock.json`, stringifyProjectFile(file));
  }

  function handleExportBackup() {
    const file = createBackupExportFile({
      projects,
      activeProjectId,
      selectedDesignSystem,
    });
    downloadJsonFile(`designdock-backup-${new Date().toISOString().slice(0, 10)}.designdock-backup.json`, stringifyProjectFile(file));
  }

  async function handleImport(file: File | null) {
    if (!file) return;

    try {
      const parsed = parseDesignDockImportFile(parseJsonFileContent(await file.text()));
      const result = importDesignDockFile(parsed);

      if (result.requiresConfirmation) {
        const names = result.conflictProjectNames?.join(", ") ?? "one or more projects";
        const confirmed = window.confirm(`Import will replace existing local projects: ${names}. Continue?`);

        if (!confirmed) {
          setImportMessage("Import cancelled.");
          return;
        }

        const confirmedResult = importDesignDockFile(parsed, true);
        setImportMessage(confirmedResult.message);
        return;
      }

      setImportMessage(result.message);
    } catch (error) {
      setImportMessage(error instanceof Error ? error.message : "Import failed.");
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  return (
    <div className="space-y-4 rounded-md border border-zinc-800 bg-zinc-900/60 p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase text-zinc-500">Project</p>
          <p className="mt-1 truncate text-sm font-bold text-zinc-100">{project?.name ?? "No active project"}</p>
        </div>
        <span
          className={cx(
            "shrink-0 rounded px-2 py-1 text-[11px] font-black",
            saveStatus === "failed"
              ? "bg-rose-500/15 text-rose-200"
              : saveStatus === "saving"
                ? "bg-amber-500/15 text-amber-200"
                : "bg-teal-400/10 text-teal-200",
          )}
        >
          {saveStatusLabel(saveStatus)}
        </span>
      </div>

      <div className="space-y-2 rounded-md border border-zinc-800 bg-zinc-950/60 p-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase text-zinc-500">Storage</p>
            <p className="mt-1 text-sm font-bold text-zinc-100">
              {storageAdapter === "indexeddb" ? "IndexedDB" : storageAdapter === "localStorage" ? "localStorage" : "Checking"}
            </p>
          </div>
          <Button className="min-h-8 px-2 py-1 text-xs" onClick={() => void runStorageHealthCheck()} variant="ghost">
            Check
          </Button>
        </div>
        {storageWarning ? <p className="text-xs leading-5 text-amber-200">{storageWarning}</p> : null}
        {storageHealth ? (
          <div className="grid grid-cols-4 gap-1 text-[11px] font-bold text-zinc-400">
            <span>Read {healthLabel(storageHealth.canRead)}</span>
            <span>Write {healthLabel(storageHealth.canWrite)}</span>
            <span>Update {healthLabel(storageHealth.canUpdate)}</span>
            <span>Delete {healthLabel(storageHealth.canDelete)}</span>
          </div>
        ) : null}
        {localStorageMigrationAvailable ? (
          <Button
            className="w-full"
            disabled={isMigratingStorage}
            onClick={() => void migrateLocalStorageProjects()}
            variant="primary"
          >
            {isMigratingStorage ? "Migrating..." : "Migrate localStorage projects"}
          </Button>
        ) : null}
      </div>

      {projects.length > 0 ? (
        <SelectControl label="Switch project" onChange={switchProject} options={projectOptions} value={activeProjectId ?? projects[0].id} />
      ) : (
        <p className="text-sm leading-6 text-zinc-500">Create or import a project to start local project history.</p>
      )}

      <ProjectRenameForm key={project?.id ?? "empty-project"} onRename={handleRename} project={project} />

      <div className="grid grid-cols-2 gap-2">
        <Button onClick={createNewProject} variant="primary">
          Blank project
        </Button>
        <Button disabled={!project} onClick={() => project && duplicateProject(project.id)}>
          Duplicate
        </Button>
        <Button disabled={!project} onClick={handleExportProject}>
          Export project
        </Button>
        <Button disabled={projects.length === 0} onClick={handleExportBackup}>
          Export backup
        </Button>
        <Button className="col-span-2" onClick={() => fileInputRef.current?.click()}>
          Import project or backup
        </Button>
        <Button className="col-span-2" disabled={!project} onClick={handleDelete} variant="danger">
          Delete project
        </Button>
      </div>

      <input
        accept=".designdock,.json,.designdock.json,.designdock-backup.json,application/json"
        className="sr-only"
        onChange={(event) => void handleImport(event.target.files?.[0] ?? null)}
        ref={fileInputRef}
        type="file"
      />

      {importMessage ? <p className="text-xs leading-5 text-zinc-400">{importMessage}</p> : null}
    </div>
  );
}
