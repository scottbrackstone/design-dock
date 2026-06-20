export type PageTypeRuleSet = {
  pageKind: string;
  primaryGoal: string;
  recommendedSections: string[];
  optionalSections: string[];
  commonMistakes: string[];
  layoutGuidance: string[];
  copyGuidance: string[];
  auditPriorities: string[];
};

export const pageTypeRuleSets: PageTypeRuleSet[] = [
  {
    pageKind: "landing-page",
    primaryGoal: "Explain the product, build trust, and drive one primary action.",
    recommendedSections: ["nav", "hero", "problem/value", "features", "proof or examples", "cta", "footer"],
    optionalSections: ["pricing teaser", "faq", "comparison", "gallery"],
    commonMistakes: ["vague hero", "too many CTAs", "repeated card grids", "fake testimonials"],
    layoutGuidance: ["vary section rhythm", "keep hero CTA above the fold", "use proof only when it has content"],
    copyGuidance: ["specific value prop", "plain benefit", "one CTA label per intent"],
    auditPriorities: ["hero clarity", "CTA focus", "copy specificity", "section order"],
  },
  {
    pageKind: "dashboard",
    primaryGoal: "Show status, priority, and the next useful action.",
    recommendedSections: ["nav/sidebar", "page header", "key metrics", "primary work area", "recent activity", "filters"],
    optionalSections: ["alerts", "saved views", "chart panel"],
    commonMistakes: ["marketing layout", "huge hero", "excessive animation", "low-density information"],
    layoutGuidance: ["use dense but readable grids", "make filters visible", "show state and hierarchy"],
    copyGuidance: ["task nouns", "clear labels", "short operational copy"],
    auditPriorities: ["density", "state clarity", "contrast", "empty/loading/error state coverage"],
  },
  {
    pageKind: "mobile-app-landing",
    primaryGoal: "Explain the app promise and make the mobile experience tangible.",
    recommendedSections: ["nav", "hero with app preview", "benefits", "screens", "download CTA", "footer"],
    optionalSections: ["reviews", "privacy note", "device feature callouts"],
    commonMistakes: ["desktop SaaS hero", "tiny phone screenshots", "generic app claims"],
    layoutGuidance: ["use one strong app preview", "keep copy short", "make mobile-first benefits explicit"],
    copyGuidance: ["tap-level benefit", "short download CTA", "specific app outcome"],
    auditPriorities: ["mobile framing", "copy specificity", "CTA clarity"],
  },
  {
    pageKind: "gallery",
    primaryGoal: "Browse, filter, review, and act on visual items.",
    recommendedSections: ["toolbar", "filters", "grid/list toggle", "item cards", "empty/loading/error states"],
    optionalSections: ["bulk actions", "upload panel", "detail preview"],
    commonMistakes: ["image cards with no state", "poor mobile grid", "missing bulk actions"],
    layoutGuidance: ["prioritize media", "keep controls close to the grid", "collapse to one or two mobile columns"],
    copyGuidance: ["visual item labels", "clear action verbs", "state messages"],
    auditPriorities: ["responsive grid", "states", "bulk action clarity"],
  },
  {
    pageKind: "settings",
    primaryGoal: "Let users change configuration safely.",
    recommendedSections: ["grouped sections", "labels", "helper text", "save/cancel", "success/error states"],
    optionalSections: ["danger zone", "activity log", "permissions"],
    commonMistakes: ["placeholder labels", "hidden destructive actions", "poor feedback"],
    layoutGuidance: ["group related settings", "make destructive actions distinct", "keep forms narrow"],
    copyGuidance: ["specific labels", "plain helper text", "clear confirmation copy"],
    auditPriorities: ["labels", "feedback states", "destructive action safety"],
  },
  {
    pageKind: "admin-panel",
    primaryGoal: "Support repeated operational decisions with clear controls and status.",
    recommendedSections: ["sidebar", "toolbar", "data table", "filters", "status cards", "activity"],
    optionalSections: ["bulk actions", "detail drawer", "audit log"],
    commonMistakes: ["marketing hero", "random metrics", "weak filters", "unclear destructive actions"],
    layoutGuidance: ["use product density", "make sorting/filtering obvious", "surface errors and empty states"],
    copyGuidance: ["operational labels", "status language", "specific action verbs"],
    auditPriorities: ["information density", "control clarity", "state coverage"],
  },
  {
    pageKind: "portfolio-homepage",
    primaryGoal: "Introduce the person or studio and make the work memorable.",
    recommendedSections: ["intro", "featured work", "capabilities", "about", "contact", "footer"],
    optionalSections: ["process", "press", "selected clients"],
    commonMistakes: ["generic SaaS copy", "fake metrics", "all-card work grid"],
    layoutGuidance: ["let work samples lead", "use editorial spacing", "avoid repetitive card grids"],
    copyGuidance: ["specific practice", "concrete work outcomes", "short contact CTA"],
    auditPriorities: ["specificity", "visual rhythm", "work clarity"],
  },
  {
    pageKind: "pricing",
    primaryGoal: "Help users compare options and pick the right plan.",
    recommendedSections: ["plan cards", "feature comparison", "faq", "guarantee/support note", "footer"],
    optionalSections: ["usage calculator", "enterprise CTA", "billing toggle"],
    commonMistakes: ["unclear plan hierarchy", "too many badges", "hidden limits"],
    layoutGuidance: ["make the recommended plan obvious", "keep comparison scannable", "show constraints honestly"],
    copyGuidance: ["specific plan names", "clear billing labels", "short conversion CTA"],
    auditPriorities: ["plan clarity", "CTA focus", "contrast", "comparison readability"],
  },
  {
    pageKind: "form-workflow",
    primaryGoal: "Help users complete a task with confidence and recover from errors.",
    recommendedSections: ["step header", "form groups", "validation", "review", "actions", "state feedback"],
    optionalSections: ["progress tracker", "save draft", "help panel"],
    commonMistakes: ["placeholder labels", "unclear required fields", "no error states"],
    layoutGuidance: ["keep fields grouped", "show progress", "make primary/secondary actions distinct"],
    copyGuidance: ["real labels", "plain validation messages", "clear completion copy"],
    auditPriorities: ["labels", "error states", "CTA clarity", "mobile field layout"],
  },
];

export function normalizePageKind(pageKind?: string) {
  const normalized = pageKind?.toLowerCase().replace(/_/g, "-").trim();
  if (!normalized) return "landing-page";

  if (normalized.includes("mobile")) return "mobile-app-landing";
  if (normalized.includes("admin")) return "admin-panel";
  if (normalized.includes("portfolio")) return "portfolio-homepage";
  if (normalized.includes("settings")) return "settings";
  if (normalized.includes("pricing")) return "pricing";
  if (normalized.includes("gallery") || normalized.includes("photo")) return "gallery";
  if (normalized.includes("form") || normalized.includes("workflow")) return "form-workflow";
  if (normalized.includes("dashboard")) return "dashboard";
  return normalized;
}

export function getPageTypeRules(pageKind?: string) {
  const normalized = normalizePageKind(pageKind);
  return pageTypeRuleSets.find((rules) => rules.pageKind === normalized) ?? pageTypeRuleSets[0];
}
