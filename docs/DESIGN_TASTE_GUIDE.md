# DesignDock Design Taste Guide

DesignDock should read the brief before choosing an aesthetic. A prompt for a wedding photo app, a data dashboard, a portfolio, and an admin settings screen should not collapse into the same SaaS landing page.

Before generating, refining, auditing, or exporting a design, infer:

- The likely user and audience.
- The surface type: brand/marketing or product/tool.
- The product category and design intent.
- The selected design system's real constraints.
- The content hierarchy the page must communicate.

## DesignDock's north star

DesignDock should generate UI that feels specific to the product, visually disciplined, easy to edit, and practical to export into real React/Tailwind code.

## Taste Principles

- Separate brand surfaces from product surfaces. Landing pages, portfolios, campaigns, public homepages, and event pages can carry more brand expression. Dashboards, admin panels, settings, tools, and form workflows should prioritize repeated-use clarity.
- Do not default every design to the same SaaS template. Pick the section structure, density, copy voice, and visual rhythm from the brief.
- Use the selected design system as a constraint, not a label. Its palette, typography, radius, tone, and avoidance rules should be visible in the result.
- Prefer clear product storytelling over decoration. Visual choices should help users understand the product, decide what matters, or act with confidence.
- Prioritize hierarchy, spacing, typography, contrast, responsiveness, and clarity before expressive styling.
- A good design should remain editable through DesignDock's inspector, valid as DesignSpec JSON, and practical to export.
- A generated design fails if someone can instantly say "AI made that."

## Brand vs Product Register

Brand surfaces can use more memorable section changes, stronger visual moments, and simpler conversion flows. They still need restrained color, specific copy, and clear CTAs.

Product surfaces should feel quiet, dense enough for work, and state-aware. They should avoid marketing heroes, oversized decorative panels, and placeholder-only dashboards.

## Attribution Note

This guidance layer is DesignDock-native and was inspired by common public anti-slop/design-skill ideas, including Impeccable, Stop Slop, and Taste Skill. The rules here are adapted to DesignDock's structured DesignSpec architecture and are not copied wholesale.
