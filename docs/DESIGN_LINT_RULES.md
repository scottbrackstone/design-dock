# Design Lint Rules

DesignDock lint rules should catch deterministic design issues locally where possible. They should not require an LLM, and they should not mutate the design automatically.

## Categories

- Typography: tiny text, weak type scale, hero headings that wrap too long, line length that is too wide.
- Colour: low contrast, inconsistent accents, default AI-purple gradients, gray text on colored backgrounds, pure black/white defaults.
- Layout: repeated section families, endless card grids, nested cards, repeated split zigzags, missing mobile collapse rules.
- Hero: unclear value prop, too much text, too many elements, CTA below the fold, default stats when not useful.
- CTA: duplicate intent, long labels, too many primary actions, weak verbs.
- Cards: overuse, inconsistent radius/shadow, border plus heavy shadow everywhere, cards used where dividers or whitespace would be better.
- Accessibility: readable contrast, visible focus expectations, labels instead of placeholder-only fields, clear tap targets.
- Responsiveness: mobile columns, hero/nav overflow, fixed widths, overly large mobile padding.
- Copy: banned generic phrases, vague claims, overused AI wording, repeated CTA labels.
- Design-system consistency: tokens ignored, radius/shadow/color choices drifting from the selected system.
- AI-tell detection: generic gradients, identical three-card grids, repeated eyebrows, fake dashboards, fake logos, and formulaic copy.

Lint rules should produce severity, category, affected node when available, a clear message, and a suggested fix. Some fixes can be applied safely through DesignSpec transforms; others should remain advice.
