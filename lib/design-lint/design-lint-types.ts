export type DesignLintSeverity = "low" | "medium" | "high";

export type DesignLintCategory =
  | "typography"
  | "colour"
  | "layout"
  | "hero"
  | "cards"
  | "copy"
  | "accessibility"
  | "responsiveness"
  | "design-system"
  | "ai-tell";

export type DesignLintIssue = {
  id: string;
  severity: DesignLintSeverity;
  category: DesignLintCategory;
  message: string;
  nodeId?: string;
  sectionId?: string;
  suggestedFix?: string;
};

export type DesignLintResult = {
  issues: DesignLintIssue[];
  score: number;
};

const severityPenalty: Record<DesignLintSeverity, number> = {
  high: 12,
  medium: 7,
  low: 3,
};

export function scoreDesignLintIssues(issues: DesignLintIssue[]) {
  const penalty = issues.reduce((total, issue) => total + severityPenalty[issue.severity], 0);
  return Math.max(0, Math.min(100, 100 - penalty));
}

export function sortDesignLintIssues(issues: DesignLintIssue[]) {
  const rank: Record<DesignLintSeverity, number> = { high: 0, medium: 1, low: 2 };
  return [...issues].sort((a, b) => {
    const severityDelta = rank[a.severity] - rank[b.severity];
    if (severityDelta !== 0) return severityDelta;
    return a.category.localeCompare(b.category) || a.message.localeCompare(b.message);
  });
}
