import type { DesignProject, DesignSystemSnapshot } from "@/lib/design-schema";
import { createSnapshot, localStorageProjectStore } from "@/lib/local-project-store";

export async function saveProject(project: DesignProject) {
  const snapshot = await localStorageProjectStore.loadSnapshot();
  const projects = snapshot.projects.some((item) => item.id === project.id)
    ? snapshot.projects.map((item) => (item.id === project.id ? project : item))
    : [...snapshot.projects, project];

  await localStorageProjectStore.saveSnapshot(createSnapshot(projects, project.id, snapshot.selectedDesignSystem));
}

export async function loadProject(): Promise<DesignProject | null> {
  const snapshot = await localStorageProjectStore.loadSnapshot();
  return snapshot.projects.find((project) => project.id === snapshot.activeProjectId) ?? snapshot.projects[0] ?? null;
}

export async function clearProject() {
  await localStorageProjectStore.clear();
}

export async function saveSelectedDesignSystem(designSystem: DesignSystemSnapshot) {
  const snapshot = await localStorageProjectStore.loadSnapshot();
  await localStorageProjectStore.saveSnapshot(createSnapshot(snapshot.projects, snapshot.activeProjectId, designSystem));
}

export async function loadSelectedDesignSystem(): Promise<DesignSystemSnapshot | null> {
  return (await localStorageProjectStore.loadSnapshot()).selectedDesignSystem;
}
