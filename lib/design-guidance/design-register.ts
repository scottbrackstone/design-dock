export type DesignRegister = "brand" | "product";

const brandTerms = [
  "landing",
  "marketing",
  "portfolio",
  "campaign",
  "event",
  "wedding",
  "homepage",
  "home page",
  "one-page",
  "one page",
  "public site",
  "website",
  "pricing page",
];

const productTerms = [
  "dashboard",
  "admin",
  "settings",
  "app shell",
  "form",
  "workflow",
  "gallery manager",
  "tool",
  "data",
  "table",
  "reports",
  "operator",
  "management",
  "console",
];

function includesAny(value: string, terms: string[]) {
  return terms.some((term) => value.includes(term));
}

export function inferDesignRegister(input: {
  prompt: string;
  pageKind?: string;
  designSystemName?: string;
}): DesignRegister {
  const haystack = [input.prompt, input.pageKind, input.designSystemName].filter(Boolean).join(" ").toLowerCase();

  if (includesAny(haystack, productTerms)) return "product";
  if (includesAny(haystack, brandTerms)) return "brand";

  return "product";
}
