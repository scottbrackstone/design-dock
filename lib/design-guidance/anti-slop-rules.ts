import type { DesignRegister } from "@/lib/design-guidance/design-register";

export type AntiSlopRule = {
  id: string;
  severity: "low" | "medium" | "high";
  category:
    | "typography"
    | "colour"
    | "layout"
    | "hero"
    | "cards"
    | "motion"
    | "copy"
    | "accessibility"
    | "responsiveness"
    | "ai-tell";
  rule: string;
  avoid: string[];
  prefer: string[];
  appliesTo: Array<DesignRegister | "all">;
};

export const antiSlopRules: AntiSlopRule[] = [
  {
    id: "type-scale-specificity",
    severity: "medium",
    category: "typography",
    rule: "Use a clear type scale that fits the surface instead of defaulting every design to the same font and size rhythm.",
    avoid: ["Inter for every mood", "tiny body text", "hero headings that wrap beyond three lines"],
    prefer: ["selected system typography", "readable body sizes", "strong hero hierarchy"],
    appliesTo: ["all"],
  },
  {
    id: "colour-strategy",
    severity: "high",
    category: "colour",
    rule: "Pick a colour strategy before styling individual sections.",
    avoid: ["random purple/blue gradients", "pure black/white defaults", "low-contrast gray text"],
    prefer: ["one consistent accent", "restrained palette", "readable foreground/background pairs"],
    appliesTo: ["all"],
  },
  {
    id: "layout-variety",
    severity: "medium",
    category: "layout",
    rule: "Vary layout families where the content changes purpose.",
    avoid: ["endless identical card grids", "repeated zigzag split sections", "nested cards"],
    prefer: ["whitespace", "dividers", "typographic groupings", "purposeful section changes"],
    appliesTo: ["brand"],
  },
  {
    id: "product-density",
    severity: "medium",
    category: "layout",
    rule: "Product surfaces should favor scan-friendly density over marketing-scale decoration.",
    avoid: ["huge marketing heroes", "random dashboard rectangles", "low-density controls"],
    prefer: ["clear page header", "stateful work area", "filters", "empty/loading/error states"],
    appliesTo: ["product"],
  },
  {
    id: "hero-discipline",
    severity: "high",
    category: "hero",
    rule: "The hero should communicate product value quickly and keep the CTA visible.",
    avoid: ["default hero stats", "long hero subtext", "logo/pricing/feature clutter in the hero"],
    prefer: ["specific value prop", "short body copy", "one primary action"],
    appliesTo: ["brand"],
  },
  {
    id: "cards-are-not-default",
    severity: "medium",
    category: "cards",
    rule: "Use cards only when they communicate grouping, hierarchy, or repeated items.",
    avoid: ["cards for every paragraph", "border plus huge shadow everywhere", "radius above 24px on ordinary cards"],
    prefer: ["dividers", "contrast bands", "type hierarchy", "image-led grouping"],
    appliesTo: ["all"],
  },
  {
    id: "purposeful-motion",
    severity: "low",
    category: "motion",
    rule: "Motion should serve meaning and respect reduced motion.",
    avoid: ["bounce easing by default", "elastic gimmicks", "animating layout properties"],
    prefer: ["subtle state transitions", "opacity/transform motion", "reduced-motion-safe behavior"],
    appliesTo: ["all"],
  },
  {
    id: "accessible-basics",
    severity: "high",
    category: "accessibility",
    rule: "Generated UI must preserve readable contrast, labels, and focus expectations.",
    avoid: ["placeholder-as-label", "custom cursors", "muted text on tinted backgrounds"],
    prefer: ["visible focus states", "real labels", "high contrast buttons"],
    appliesTo: ["all"],
  },
  {
    id: "specific-copy",
    severity: "medium",
    category: "copy",
    rule: "Copy should be direct and product-specific.",
    avoid: ["unlock", "seamless", "revolutionary", "game-changing", "copy that fits anything"],
    prefer: ["concrete user benefit", "short CTA labels", "active voice"],
    appliesTo: ["all"],
  },
  {
    id: "responsive-first",
    severity: "high",
    category: "responsiveness",
    rule: "Every multi-column design needs a mobile fallback.",
    avoid: ["desktop-only grids", "hero/nav overflow", "wrapped CTA labels"],
    prefer: ["single-column mobile grids", "compact mobile padding", "stacked CTAs"],
    appliesTo: ["all"],
  },
];

export function getAntiSlopRulesForRegister(register: DesignRegister) {
  return antiSlopRules.filter((rule) => rule.appliesTo.includes("all") || rule.appliesTo.includes(register));
}

export function compactAntiSlopGuidance(register: DesignRegister) {
  return getAntiSlopRulesForRegister(register)
    .slice(0, 8)
    .map((rule) => `- ${rule.rule} Avoid: ${rule.avoid.slice(0, 3).join(", ")}. Prefer: ${rule.prefer.slice(0, 3).join(", ")}.`)
    .join("\n");
}
