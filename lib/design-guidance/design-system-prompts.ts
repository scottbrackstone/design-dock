import type { DesignSystemSnapshot } from "@/lib/design-schema";

export type DesignSystem = DesignSystemSnapshot;

const builtInGuidance: Record<string, string[]> = {
  "premium-saas": [
    "polished, trustworthy, spacious",
    "neutral base with one strong accent",
    "subtle borders and clear hierarchy",
    "avoid loud gradients",
    "avoid fake enterprise logo walls unless requested",
  ],
  "vercel-linear-dark": [
    "dark, minimal, sharp",
    "subtle surfaces and restrained motion",
    "clean type and crisp borders",
    "avoid neon cyberpunk unless requested",
    "avoid over-glowing cards",
  ],
  "apple-like-minimal": [
    "calm, spacious, refined",
    "strong product clarity and generous whitespace",
    "soft hierarchy with few cards",
    "avoid clutter",
    "avoid too many repeated cards",
  ],
  "warm-creator-brand": [
    "human, friendly, approachable",
    "softer palette with clear storytelling",
    "editorial warmth without mushy contrast",
    "avoid generic beige/brass unless requested",
    "avoid childish visuals",
  ],
  "bold-startup-landing": [
    "conversion-focused, high contrast, confident type",
    "sharper section changes and stronger CTA",
    "use accent colour with discipline",
    "avoid chaos",
    "avoid too many competing actions",
  ],
};

export function buildDesignSystemPromptGuidance(designSystem: DesignSystem): string {
  const tokens = designSystem.tokens;
  const guidance = builtInGuidance[designSystem.id] ?? [
    designSystem.rules.visualTone,
    ...designSystem.rules.layoutRules.slice(0, 2),
    ...designSystem.rules.accessibilityRules.slice(0, 2),
  ];

  return [
    `${designSystem.name}: ${guidance.join("; ")}.`,
    `Use tokens: background ${tokens.colors.background}, foreground ${tokens.colors.foreground}, primary ${tokens.colors.primary}, accent ${tokens.colors.accent}, card ${tokens.colors.card}, border ${tokens.colors.border}.`,
    `Typography: heading ${tokens.typography.headingFont}, body ${tokens.typography.bodyFont}. Radius scale: sm ${tokens.radius.sm}, md ${tokens.radius.md}, lg ${tokens.radius.lg}, xl ${tokens.radius.xl}.`,
    `Avoid: ${designSystem.rules.avoid.slice(0, 4).join(", ")}.`,
  ].join("\n");
}
