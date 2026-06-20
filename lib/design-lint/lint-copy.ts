import { copyRules } from "@/lib/design-guidance/copy-rules";
import type { DesignLintIssue } from "@/lib/design-lint/design-lint-types";

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 50);
}

export function lintCopyText(input: {
  value: string;
  nodeId?: string;
  sectionId?: string;
  context?: string;
}): DesignLintIssue[] {
  const lower = input.value.toLowerCase();
  const issues: DesignLintIssue[] = [];

  for (const rule of copyRules) {
    const match = rule.avoid.find((phrase) => lower.includes(phrase));
    if (match) {
      issues.push({
        id: `copy-${rule.id}-${slugify(input.nodeId ?? input.sectionId ?? input.value)}`,
        severity: rule.severity,
        category: "copy",
        nodeId: input.nodeId,
        sectionId: input.sectionId,
        message: `Copy uses generic phrase "${match}".`,
        suggestedFix: rule.prefer,
      });
    }
  }

  const vagueClaims = ["better experience", "modern solution", "powerful platform", "everything you need"];
  const vagueClaim = vagueClaims.find((phrase) => lower.includes(phrase));
  if (vagueClaim) {
    issues.push({
      id: `copy-vague-${slugify(input.nodeId ?? input.value)}`,
      severity: "low",
      category: "copy",
      nodeId: input.nodeId,
      sectionId: input.sectionId,
      message: `Copy sounds vague: "${vagueClaim}".`,
      suggestedFix: `Replace it with a specific product outcome${input.context ? ` for ${input.context}` : ""}.`,
    });
  }

  return issues;
}

export function lintDuplicateCtaLabels(buttons: Array<{ id: string; label: string; sectionId?: string }>): DesignLintIssue[] {
  const seen = new Map<string, string>();
  const issues: DesignLintIssue[] = [];

  for (const button of buttons) {
    const normalized = button.label.trim().toLowerCase();
    if (!normalized) continue;

    const firstId = seen.get(normalized);
    if (firstId && firstId !== button.id) {
      issues.push({
        id: `copy-duplicate-cta-${slugify(button.id)}`,
        severity: "medium",
        category: "copy",
        nodeId: button.id,
        sectionId: button.sectionId,
        message: `CTA label "${button.label}" repeats the same intent.`,
        suggestedFix: "Use distinct labels for distinct actions, or keep one CTA.",
      });
    } else {
      seen.set(normalized, button.id);
    }
  }

  return issues;
}
