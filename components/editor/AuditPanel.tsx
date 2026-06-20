"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import {
  applyAuditFix,
  auditDesignSpecWithScore,
  sortAuditIssues,
  type AuditIssue,
  type AuditSeverity,
} from "@/lib/design-audit";
import type { DesignSpec } from "@/lib/design-schema";
import { findNodeById, getNodeLabel } from "@/lib/design-actions";
import { cx } from "@/lib/tailwind-utils";
import { useDesignStore } from "@/store/useDesignStore";

type AuditResponse = {
  issues?: AuditIssue[];
  error?: string;
};

const severityClasses: Record<AuditSeverity, string> = {
  high: "border-rose-400/50 bg-rose-500/15 text-rose-100",
  medium: "border-amber-400/50 bg-amber-500/15 text-amber-100",
  low: "border-sky-400/50 bg-sky-500/15 text-sky-100",
};

function issueTargetLabel(currentSpec: DesignSpec, issue: AuditIssue) {
  const targetId = issue.nodeId ?? issue.sectionId;
  if (!targetId) return "Whole design";
  return findNodeById(currentSpec, targetId) ? getNodeLabel(currentSpec, targetId) : targetId;
}

function mergeAiIssues(current: AuditIssue[], aiIssues: AuditIssue[]) {
  return sortAuditIssues([...current.filter((issue) => issue.source !== "ai"), ...aiIssues]);
}

export function AuditPanel() {
  const [issues, setIssues] = useState<AuditIssue[]>([]);
  const [isRunningLocal, setIsRunningLocal] = useState(false);
  const [isRunningAi, setIsRunningAi] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const { currentSpec, selectNode, updateCurrentSpec } = useDesignStore();
  const issueCounts = useMemo(
    () => ({
      high: issues.filter((issue) => issue.severity === "high").length,
      medium: issues.filter((issue) => issue.severity === "medium").length,
      low: issues.filter((issue) => issue.severity === "low").length,
    }),
    [issues],
  );

  function runLocalAudit() {
    if (!currentSpec) return;

    setIsRunningLocal(true);
    try {
      const result = auditDesignSpecWithScore(currentSpec);
      setIssues(result.issues);
      setMessage(
        result.issues.length
          ? `Local audit score ${result.score}/100. ${result.issues.length} issues found.`
          : `Local audit score ${result.score}/100. No local issues found.`,
      );
    } finally {
      setIsRunningLocal(false);
    }
  }

  async function runAiAudit() {
    if (!currentSpec) return;

    setIsRunningAi(true);
    setMessage(null);

    try {
      const response = await fetch("/api/audit-design", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentSpec }),
      });
      const payload = (await response.json()) as AuditResponse;

      if (!response.ok) {
        setMessage(payload.error ?? "AI audit is unavailable.");
        return;
      }

      const aiIssues = payload.issues ?? [];
      setIssues((current) => mergeAiIssues(current, aiIssues));
      setMessage(aiIssues.length ? `${aiIssues.length} AI issues added.` : "AI audit returned no issues.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "AI audit failed.");
    } finally {
      setIsRunningAi(false);
    }
  }

  function selectIssueTarget(issue: AuditIssue) {
    if (!currentSpec) return;

    const targetId = issue.nodeId ?? issue.sectionId;
    if (targetId && findNodeById(currentSpec, targetId)) {
      selectNode(targetId);
    }
  }

  function applyFix(issue: AuditIssue) {
    if (!issue.fix) return;

    updateCurrentSpec((spec) => applyAuditFix(spec, issue));
    setIssues((current) => current.filter((item) => item.id !== issue.id));
    setMessage("Applied suggested fix. Undo is available.");
  }

  return (
    <section className="space-y-3 rounded-md border border-zinc-800 bg-zinc-900/60 p-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase text-zinc-500">Audit</p>
          <p className="mt-1 text-sm font-bold text-zinc-100">Design quality</p>
        </div>
        {issues.length > 0 ? (
          <div className="flex gap-1 text-[11px] font-black">
            <span className="rounded bg-rose-500/15 px-1.5 py-1 text-rose-100">{issueCounts.high}</span>
            <span className="rounded bg-amber-500/15 px-1.5 py-1 text-amber-100">{issueCounts.medium}</span>
            <span className="rounded bg-sky-500/15 px-1.5 py-1 text-sky-100">{issueCounts.low}</span>
          </div>
        ) : null}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Button disabled={!currentSpec || isRunningLocal} onClick={runLocalAudit} variant="primary">
          {isRunningLocal ? "Auditing..." : "Run audit"}
        </Button>
        <Button disabled={!currentSpec || isRunningAi} onClick={() => void runAiAudit()}>
          {isRunningAi ? "Checking..." : "AI audit"}
        </Button>
      </div>

      {message ? <p className="text-xs leading-5 text-zinc-400">{message}</p> : null}

      <div className="max-h-80 space-y-2 overflow-auto pr-1 editor-scrollbar">
        {!currentSpec ? <p className="text-sm leading-6 text-zinc-500">Create or import a project to audit it.</p> : null}
        {currentSpec && issues.length === 0 ? (
          <p className="text-sm leading-6 text-zinc-500">Run an audit to surface hierarchy, spacing, contrast, CTA, and mobile risks.</p>
        ) : null}
        {currentSpec
          ? issues.map((issue) => {
              const targetId = issue.nodeId ?? issue.sectionId;
              const canSelect = Boolean(targetId && findNodeById(currentSpec, targetId));

              return (
                <article className="rounded-md border border-zinc-800 bg-zinc-950/60 p-3" key={issue.id}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={cx(
                            "rounded border px-1.5 py-0.5 text-[11px] font-black uppercase",
                            severityClasses[issue.severity],
                          )}
                        >
                          {issue.severity}
                        </span>
                        <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-[11px] font-black uppercase text-zinc-300">
                          {issue.source}
                        </span>
                      </div>
                      <h3 className="mt-2 text-sm font-black text-zinc-100">{issue.title}</h3>
                    </div>
                  </div>

                  <p className="mt-2 text-[11px] font-bold uppercase tracking-normal text-zinc-500">
                    {issueTargetLabel(currentSpec, issue)}
                  </p>
                  <p className="mt-2 text-xs leading-5 text-zinc-400">{issue.explanation}</p>
                  <p className="mt-2 text-xs leading-5 text-zinc-300">{issue.suggestedFix}</p>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {canSelect ? (
                      <Button className="min-h-8 px-2 py-1 text-xs" onClick={() => selectIssueTarget(issue)} variant="ghost">
                        Select
                      </Button>
                    ) : null}
                    {issue.fix ? (
                      <Button className="min-h-8 px-2 py-1 text-xs" onClick={() => applyFix(issue)} variant="primary">
                        Apply fix
                      </Button>
                    ) : null}
                  </div>
                </article>
              );
            })
          : null}
      </div>
    </section>
  );
}
