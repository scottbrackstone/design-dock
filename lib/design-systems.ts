import type { DesignSystemSnapshot, DesignTokens } from "@/lib/design-schema";

export type ColorTokenName = keyof DesignTokens["colors"];
export type RadiusTokenName = keyof DesignTokens["radius"];
export type TypographyTokenName = keyof DesignTokens["typography"];

export const predefinedDesignSystems: DesignSystemSnapshot[] = [
  {
    id: "premium-saas",
    name: "Premium SaaS",
    tokens: {
      colors: {
        background: "#f8fafc",
        foreground: "#111827",
        muted: "#64748b",
        primary: "#0f766e",
        secondary: "#f59e0b",
        accent: "#be123c",
        border: "#d4d4d8",
        card: "#ffffff",
      },
      typography: {
        headingFont: "Inter",
        bodyFont: "Inter",
        monoFont: "ui-monospace",
      },
      radius: {
        sm: 8,
        md: 12,
        lg: 18,
        xl: 28,
        full: 999,
      },
    },
    rules: {
      visualTone: "Clean, premium, crisp, and product-focused.",
      layoutRules: [
        "Use generous section spacing.",
        "Keep content aligned to a clear grid.",
        "Prefer compact, scannable cards for feature lists.",
      ],
      accessibilityRules: [
        "Use readable type sizes.",
        "Maintain strong colour contrast.",
        "Make buttons clear and descriptive.",
      ],
      avoid: ["Busy backgrounds", "Tiny text", "Decorative clutter"],
      preferredPatterns: ["Hero with CTA", "Card grids", "Stats band", "Focused footer"],
    },
  },
  {
    id: "vercel-linear-dark",
    name: "Vercel/Linear Dark",
    tokens: {
      colors: {
        background: "#09090b",
        foreground: "#fafafa",
        muted: "#a1a1aa",
        primary: "#fafafa",
        secondary: "#27272a",
        accent: "#22d3ee",
        border: "#27272a",
        card: "#18181b",
      },
      typography: {
        headingFont: "Inter",
        bodyFont: "Inter",
        monoFont: "ui-monospace",
      },
      radius: {
        sm: 6,
        md: 8,
        lg: 12,
        xl: 16,
        full: 999,
      },
    },
    rules: {
      visualTone: "Precise, dark, technical, and quietly premium.",
      layoutRules: [
        "Use restrained contrast and crisp borders.",
        "Prefer dense information blocks with generous breathing room.",
        "Keep accent colour usage deliberate.",
      ],
      accessibilityRules: [
        "Avoid low-contrast grey text on dark surfaces.",
        "Keep interactive targets visually distinct.",
        "Use clear focusable controls.",
      ],
      avoid: ["Colourful gradients", "Soft decorative shapes", "Oversized marketing flourishes"],
      preferredPatterns: ["Dark hero", "Thin borders", "Metric rows", "Compact feature cards"],
    },
  },
  {
    id: "apple-like-minimal",
    name: "Apple-like Minimal",
    tokens: {
      colors: {
        background: "#f5f5f7",
        foreground: "#1d1d1f",
        muted: "#6e6e73",
        primary: "#0071e3",
        secondary: "#ffffff",
        accent: "#34c759",
        border: "#d2d2d7",
        card: "#ffffff",
      },
      typography: {
        headingFont: "SF Pro Display",
        bodyFont: "SF Pro Text",
        monoFont: "ui-monospace",
      },
      radius: {
        sm: 12,
        md: 16,
        lg: 24,
        xl: 32,
        full: 999,
      },
    },
    rules: {
      visualTone: "Minimal, airy, confident, and product-led.",
      layoutRules: [
        "Let large typography and whitespace carry the hierarchy.",
        "Use simple surfaces and very few borders.",
        "Keep calls to action direct and uncluttered.",
      ],
      accessibilityRules: [
        "Keep body copy comfortably large.",
        "Maintain clear hierarchy between heading and supporting text.",
        "Use concise button labels.",
      ],
      avoid: ["Crowded cards", "Heavy shadows", "Dense dashboards"],
      preferredPatterns: ["Centered hero", "Large product preview", "Simple CTA", "Editorial spacing"],
    },
  },
  {
    id: "warm-creator-brand",
    name: "Warm Creator Brand",
    tokens: {
      colors: {
        background: "#fff7ed",
        foreground: "#2f1b12",
        muted: "#9a5b38",
        primary: "#ea580c",
        secondary: "#f59e0b",
        accent: "#be123c",
        border: "#fed7aa",
        card: "#fffbeb",
      },
      typography: {
        headingFont: "Georgia",
        bodyFont: "Inter",
        monoFont: "ui-monospace",
      },
      radius: {
        sm: 10,
        md: 16,
        lg: 24,
        xl: 30,
        full: 999,
      },
    },
    rules: {
      visualTone: "Warm, human, editorial, and creator-friendly.",
      layoutRules: [
        "Use inviting cards and soft contrast.",
        "Blend editorial headings with practical product sections.",
        "Make the primary CTA feel friendly and confident.",
      ],
      accessibilityRules: [
        "Keep warm palettes readable.",
        "Use strong foreground colours for long text.",
        "Avoid relying on colour alone for hierarchy.",
      ],
      avoid: ["Cold corporate tone", "Overly dense layouts", "Tiny captions"],
      preferredPatterns: ["Creator hero", "Story-led cards", "Warm CTA", "Gallery previews"],
    },
  },
  {
    id: "bold-startup-landing",
    name: "Bold Startup Landing",
    tokens: {
      colors: {
        background: "#0f172a",
        foreground: "#f8fafc",
        muted: "#cbd5e1",
        primary: "#eab308",
        secondary: "#06b6d4",
        accent: "#f43f5e",
        border: "#334155",
        card: "#1e293b",
      },
      typography: {
        headingFont: "Inter",
        bodyFont: "Inter",
        monoFont: "ui-monospace",
      },
      radius: {
        sm: 4,
        md: 8,
        lg: 14,
        xl: 22,
        full: 999,
      },
    },
    rules: {
      visualTone: "High-energy, conversion-focused, sharp, and memorable.",
      layoutRules: [
        "Use strong contrast and decisive CTAs.",
        "Make proof points highly visible.",
        "Balance bold colour with readable dark surfaces.",
      ],
      accessibilityRules: [
        "Check bright accent colours against dark backgrounds.",
        "Keep headings readable at mobile sizes.",
        "Use clear button hierarchy.",
      ],
      avoid: ["Muted generic SaaS styling", "Low-energy CTAs", "Decorative clutter"],
      preferredPatterns: ["Bold hero", "Proof stats", "High-contrast cards", "Punchy CTA band"],
    },
  },
];

export const defaultDesignSystem = cloneDesignSystem(predefinedDesignSystems[0]);

export function cloneDesignSystem(system: DesignSystemSnapshot): DesignSystemSnapshot {
  return {
    ...system,
    tokens: {
      colors: { ...system.tokens.colors },
      typography: { ...system.tokens.typography },
      radius: { ...system.tokens.radius },
    },
    rules: {
      visualTone: system.rules.visualTone,
      layoutRules: [...system.rules.layoutRules],
      accessibilityRules: [...system.rules.accessibilityRules],
      avoid: [...system.rules.avoid],
      preferredPatterns: [...system.rules.preferredPatterns],
    },
  };
}

export function getDesignSystemById(id: string): DesignSystemSnapshot {
  const preset = predefinedDesignSystems.find((system) => system.id === id);
  return cloneDesignSystem(preset ?? defaultDesignSystem);
}

export function isHexColor(value: string) {
  return /^#(?:[0-9a-fA-F]{3}){1,2}$/.test(value);
}

function expandHex(hex: string) {
  const value = hex.replace("#", "");
  return value.length === 3
    ? value
        .split("")
        .map((character) => `${character}${character}`)
        .join("")
    : value;
}

function hexToRgb(hex: string) {
  const expanded = expandHex(hex);
  const value = Number.parseInt(expanded, 16);
  return {
    r: (value >> 16) & 255,
    g: (value >> 8) & 255,
    b: value & 255,
  };
}

export function isDarkHexColor(hex: string) {
  if (!isHexColor(hex)) return false;

  const { r, g, b } = hexToRgb(hex);
  const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  return luminance < 0.46;
}

export function getReadableTextColor(backgroundColor: string) {
  return isDarkHexColor(backgroundColor) ? "#ffffff" : "#111827";
}
