export type CopyRule = {
  id: string;
  severity: "low" | "medium" | "high";
  avoid: string[];
  prefer: string;
  reason: string;
};

export const copyRules: CopyRule[] = [
  {
    id: "generic-transformation",
    severity: "medium",
    avoid: ["seamless", "unlock", "empower", "transform", "revolutionary", "game-changing"],
    prefer: "Name the concrete thing the user can do.",
    reason: "Generic transformation claims make the product sound interchangeable.",
  },
  {
    id: "future-throat-clearing",
    severity: "medium",
    avoid: ["in today's fast-paced", "at its core", "the future of", "designed to help you"],
    prefer: "Open with the product outcome.",
    reason: "Throat-clearing delays the useful information.",
  },
  {
    id: "softener-crutches",
    severity: "low",
    avoid: ["effortlessly", "simply", "actually", "really", "robust", "intuitive platform", "all-in-one solution"],
    prefer: "Use plain nouns and verbs.",
    reason: "Softening words and jargon reduce trust.",
  },
];

const replacementPairs: Array<[RegExp, string]> = [
  [/\bunlock\b/gi, "get"],
  [/\bseamless\b/gi, "clear"],
  [/\bempower(s|ed|ing)?\b/gi, "help"],
  [/\brevolutionary\b/gi, "useful"],
  [/\bgame-changing\b/gi, "practical"],
  [/\btransform the way you\b/gi, "change how you"],
  [/\bin today's fast-paced world,?\s*/gi, ""],
  [/\bat its core,?\s*/gi, ""],
  [/\bthe future of\b/gi, "a better way to handle"],
  [/\bdesigned to help you\b/gi, "helps you"],
  [/\beffortlessly\b/gi, ""],
  [/\bsimply\b/gi, ""],
  [/\bintuitive platform\b/gi, "tool"],
  [/\ball-in-one solution\b/gi, "workspace"],
];

function compactWhitespace(value: string) {
  return value.replace(/\s+/g, " ").replace(/\s+([,.!?])/g, "$1").trim();
}

export function getCopyGuidanceForPrompt(prompt: string): string[] {
  const lower = prompt.toLowerCase();
  const matches = copyRules.filter((rule) => rule.avoid.some((phrase) => lower.includes(phrase)));
  const base = [
    "Use product-specific headings and concrete benefits.",
    "Keep CTA labels short and use one label per intent.",
    "Avoid generic AI marketing phrases.",
  ];

  if (matches.length === 0) return base;
  return [...matches.map((rule) => `${rule.reason} ${rule.prefer}`), ...base];
}

export function rewriteGenericUICopy(input: string, productContext: string): string {
  let next = input;
  for (const [pattern, replacement] of replacementPairs) {
    next = next.replace(pattern, replacement);
  }

  next = compactWhitespace(next);

  if (!next || next.toLowerCase() === input.toLowerCase().trim()) {
    return input;
  }

  if (next.length < 18 && productContext.trim()) {
    return compactWhitespace(`${next} for ${productContext.trim()}`);
  }

  return next;
}

export function containsWeakCopy(value: string) {
  const lower = value.toLowerCase();
  return copyRules.some((rule) => rule.avoid.some((phrase) => lower.includes(phrase)));
}
