"use client";

import { useRef, useState } from "react";
import { SelectControl } from "@/components/inspector/SelectControl";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { designTemplates, samplePrompts, type DesignTemplateId } from "@/lib/design-templates";
import { parseDesignDockImportFile, parseJsonFileContent } from "@/lib/project-files";
import { cx } from "@/lib/tailwind-utils";
import { useDesignStore } from "@/store/useDesignStore";

type StartMode = "blank" | "template" | "prompt" | "import";

const startModes: Array<{ id: StartMode; label: string }> = [
  { id: "blank", label: "Blank" },
  { id: "template", label: "Template" },
  { id: "prompt", label: "Prompt" },
  { id: "import", label: "Import" },
];

const templateOptions = designTemplates.map((template) => ({
  value: template.id,
  label: template.name,
}));

const importAccept = ".designdock,.json,.designdock.json,.designdock-backup.json,application/json";

export function StarterPanel() {
  const [mode, setMode] = useState<StartMode>("template");
  const [templateId, setTemplateId] = useState<DesignTemplateId>(designTemplates[0].id);
  const [prompt, setPrompt] = useState(samplePrompts[0].prompt);
  const [importMessage, setImportMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const {
    createNewProject,
    createProjectFromTemplate,
    generateDesign,
    importDesignDockFile,
    isGenerating,
    selectedDesignSystem,
  } = useDesignStore();
  const selectedTemplate = designTemplates.find((template) => template.id === templateId) ?? designTemplates[0];

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
    <section className="space-y-4 rounded-md border border-zinc-800 bg-zinc-900/60 p-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase text-zinc-500">Start from</p>
          <p className="mt-1 text-sm font-bold text-zinc-100">{selectedDesignSystem.name}</p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-1 rounded-md bg-zinc-950/70 p-1">
        {startModes.map((item) => (
          <button
            aria-pressed={mode === item.id}
            className={cx(
              "min-h-9 rounded px-2 text-xs font-black transition",
              mode === item.id ? "bg-teal-400 text-zinc-950" : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100",
            )}
            key={item.id}
            onClick={() => setMode(item.id)}
            type="button"
          >
            {item.label}
          </button>
        ))}
      </div>

      {mode === "blank" ? (
        <div className="space-y-3">
          <p className="text-sm leading-6 text-zinc-400">Start with one editable section using the selected design system.</p>
          <Button className="w-full" onClick={createNewProject} variant="primary">
            Create blank project
          </Button>
        </div>
      ) : null}

      {mode === "template" ? (
        <div className="space-y-3">
          <SelectControl label="Template" onChange={setTemplateId} options={templateOptions} value={templateId} />
          <div className="rounded-md border border-zinc-800 bg-zinc-950/60 p-3">
            <p className="text-sm font-black text-zinc-100">{selectedTemplate.name}</p>
            <p className="mt-1 text-xs leading-5 text-zinc-500">{selectedTemplate.description}</p>
          </div>
          <Button className="w-full" onClick={() => createProjectFromTemplate(templateId)} variant="primary">
            Start from template
          </Button>
        </div>
      ) : null}

      {mode === "prompt" ? (
        <form
          className="space-y-3"
          onSubmit={(event) => {
            event.preventDefault();
            void generateDesign(prompt);
          }}
        >
          <label className="block text-xs font-bold uppercase text-zinc-500" htmlFor="design-prompt">
            Prompt
          </label>
          <Textarea
            id="design-prompt"
            onChange={(event) => setPrompt(event.target.value)}
            placeholder="Describe the UI you want to design"
            rows={5}
            value={prompt}
          />
          <div className="grid grid-cols-2 gap-2">
            {samplePrompts.map((sample) => (
              <button
                className="rounded-md border border-zinc-800 bg-zinc-950/60 px-2 py-2 text-left text-xs font-bold leading-5 text-zinc-300 transition hover:border-teal-400/60 hover:text-teal-100"
                key={sample.label}
                onClick={() => setPrompt(sample.prompt)}
                type="button"
              >
                {sample.label}
              </button>
            ))}
          </div>
          <Button className="w-full" disabled={isGenerating || !prompt.trim()} type="submit" variant="primary">
            {isGenerating ? "Generating..." : "Generate from prompt"}
          </Button>
        </form>
      ) : null}

      {mode === "import" ? (
        <div className="space-y-3">
          <p className="text-sm leading-6 text-zinc-400">Import a DesignDock project or backup file from this device.</p>
          <Button className="w-full" onClick={() => fileInputRef.current?.click()} variant="primary">
            Choose .designdock file
          </Button>
          <input
            accept={importAccept}
            className="sr-only"
            onChange={(event) => void handleImport(event.target.files?.[0] ?? null)}
            ref={fileInputRef}
            type="file"
          />
          {importMessage ? <p className="text-xs leading-5 text-zinc-400">{importMessage}</p> : null}
        </div>
      ) : null}
    </section>
  );
}
