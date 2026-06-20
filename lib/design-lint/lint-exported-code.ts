import type { DesignLintIssue } from "@/lib/design-lint/design-lint-types";

function issue(id: string, severity: DesignLintIssue["severity"], message: string, suggestedFix?: string): DesignLintIssue {
  return { id, severity, category: "ai-tell", message, suggestedFix };
}

export function lintExportedCode(code: string): DesignLintIssue[] {
  const issues: DesignLintIssue[] = [];
  const lower = code.toLowerCase();

  if (/bg-clip-text|text-transparent/.test(lower)) {
    issues.push(issue("export-gradient-text", "medium", "Exported code appears to use gradient text.", "Use solid text color unless the brief specifically asks for gradient text."));
  }

  if ((lower.match(/uppercase/g) ?? []).length >= 5 && (lower.match(/tracking-/g) ?? []).length >= 5) {
    issues.push(issue("export-eyebrow-pattern", "low", "Exported code repeats uppercase tracking patterns.", "Reserve eyebrow labels for sections that need them."));
  }

  if ((lower.match(/rounded-(2xl|3xl|full)/g) ?? []).length >= 6) {
    issues.push(issue("export-over-rounded", "low", "Exported code overuses large rounded corners.", "Use the design system radius scale more selectively."));
  }

  if ((lower.match(/shadow-(lg|xl|2xl)/g) ?? []).length >= 4 && (lower.match(/border/g) ?? []).length >= 4) {
    issues.push(issue("export-shadow-border", "medium", "Exported code combines heavy shadows and borders repeatedly.", "Use either border or shadow for most surfaces, not both."));
  }

  if (/#000000|#000\b|#ffffff|#fff\b/.test(lower)) {
    issues.push(issue("export-pure-surfaces", "low", "Exported code contains pure black or pure white hex values.", "Prefer design system surface tokens unless pure contrast is intentional."));
  }

  if (/h-screen|min-h-screen/.test(lower) && /hero/i.test(code)) {
    issues.push(issue("export-screen-hero", "medium", "Exported code may force a full-screen hero.", "Avoid hero content that risks overflowing the first viewport."));
  }

  if (/placeholder=/.test(lower) && !/(label|aria-label)/.test(lower)) {
    issues.push(issue("export-placeholder-label", "high", "Exported form code may use placeholder text as the only label.", "Use visible labels for form controls."));
  }

  return issues;
}
