"use client";

import { useEffect, useMemo, useState } from "react";
import { SelectControl } from "@/components/inspector/SelectControl";
import { Button } from "@/components/ui/Button";
import { aiProviderIds, isAiProviderId, type AiProviderId, type AiProviderStatus } from "@/lib/ai/ai-provider-types";
import { cx } from "@/lib/tailwind-utils";
import { useDesignStore } from "@/store/useDesignStore";

type ProviderStatusResponse = {
  defaultProviderId: AiProviderId;
  providers: AiProviderStatus[];
};

const fallbackStatuses: AiProviderStatus[] = aiProviderIds.map((id) => ({
  id,
  label: id === "mock" ? "Mock" : id === "deepseek" ? "DeepSeek" : "MiniMax",
  configured: id === "mock",
  modelName: id === "mock" ? "local mock generator" : "Not checked",
  isDefault: id === "mock",
}));

export function AiSettingsPanel() {
  const { aiProviderId, selectAiProvider } = useDesignStore();
  const [statuses, setStatuses] = useState<AiProviderStatus[]>(fallbackStatuses);
  const [isChecking, setIsChecking] = useState(true);
  const [statusError, setStatusError] = useState<string | null>(null);
  const selectedStatus = statuses.find((status) => status.id === aiProviderId) ?? fallbackStatuses[0];
  const providerOptions = useMemo(
    () => statuses.map((status) => ({ value: status.id, label: status.label })),
    [statuses],
  );

  async function loadStatuses() {
    setIsChecking(true);
    setStatusError(null);

    try {
      const response = await fetch("/api/ai/provider-status");
      if (!response.ok) {
        throw new Error("Provider status check failed.");
      }

      const payload = (await response.json()) as ProviderStatusResponse;
      setStatuses(payload.providers);
    } catch (error) {
      setStatusError(error instanceof Error ? error.message : "Provider status check failed.");
    } finally {
      setIsChecking(false);
    }
  }

  useEffect(() => {
    let cancelled = false;

    async function loadInitialStatuses() {
      try {
        const response = await fetch("/api/ai/provider-status");
        if (!response.ok) {
          throw new Error("Provider status check failed.");
        }

        const payload = (await response.json()) as ProviderStatusResponse;
        if (!cancelled) {
          setStatuses(payload.providers);
        }
      } catch (error) {
        if (!cancelled) {
          setStatusError(error instanceof Error ? error.message : "Provider status check failed.");
        }
      } finally {
        if (!cancelled) {
          setIsChecking(false);
        }
      }
    }

    void loadInitialStatuses();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="space-y-3 rounded-md border border-zinc-800 bg-zinc-900/60 p-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase text-zinc-500">AI provider</p>
          <p className="mt-1 text-sm font-bold text-zinc-100">{selectedStatus.label}</p>
        </div>
        <span
          className={cx(
            "rounded px-2 py-1 text-[11px] font-black",
            selectedStatus.configured ? "bg-teal-400/10 text-teal-200" : "bg-amber-500/15 text-amber-100",
          )}
        >
          {selectedStatus.configured ? "Configured" : "Fallback"}
        </span>
      </div>

      <SelectControl
        label="Provider"
        onChange={(value) => {
          if (isAiProviderId(value)) {
            selectAiProvider(value);
          }
        }}
        options={providerOptions}
        value={aiProviderId}
      />

      <div className="rounded-md border border-zinc-800 bg-zinc-950/60 p-3">
        <p className="text-xs font-bold uppercase text-zinc-500">Active model</p>
        <p className="mt-1 break-words text-sm font-bold text-zinc-100">{selectedStatus.modelName}</p>
        {selectedStatus.isDefault ? <p className="mt-1 text-xs text-zinc-500">Default from server environment.</p> : null}
      </div>

      {!selectedStatus.configured && selectedStatus.id !== "mock" ? (
        <p className="rounded-md border border-amber-500/30 bg-amber-500/10 p-2 text-xs leading-5 text-amber-100">
          {selectedStatus.label} needs a server-side API key in .env.local. Mock mode remains available.
        </p>
      ) : null}

      {statusError ? <p className="text-xs leading-5 text-rose-200">{statusError}</p> : null}

      <Button className="w-full min-h-8 px-2 py-1 text-xs" disabled={isChecking} onClick={() => void loadStatuses()} variant="ghost">
        {isChecking ? "Checking..." : "Refresh provider status"}
      </Button>
    </section>
  );
}
