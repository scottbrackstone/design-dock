"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { cx } from "@/lib/tailwind-utils";
import { useDesignStore } from "@/store/useDesignStore";

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function VersionHistory() {
  const [name, setName] = useState("");
  const { project, currentSpec, restoreVersion, saveVersion } = useDesignStore();

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-bold uppercase text-zinc-500" htmlFor="version-name">
          Version name
        </label>
        <div className="mt-2 flex gap-2">
          <Input
            id="version-name"
            onChange={(event) => setName(event.target.value)}
            placeholder="Exploration A"
            value={name}
          />
          <Button
            disabled={!currentSpec}
            onClick={() => {
              saveVersion(name);
              setName("");
            }}
          >
            Save
          </Button>
        </div>
      </div>

      <div className="max-h-52 space-y-2 overflow-auto pr-1 editor-scrollbar">
        {!project && <p className="text-sm leading-6 text-zinc-500">Generate a design to start version history.</p>}
        {project?.versions.map((version) => (
          <button
            className={cx(
              "w-full rounded-md border p-3 text-left transition",
              project.activeVersionId === version.id
                ? "border-teal-400 bg-teal-400/10"
                : "border-zinc-800 bg-zinc-900/60 hover:border-zinc-600",
            )}
            key={version.id}
            onClick={() => restoreVersion(version.id)}
            type="button"
          >
            <span className="block text-sm font-bold text-zinc-100">{version.name}</span>
            <span className="mt-1 block text-xs text-zinc-500">{formatDate(version.createdAt)}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
