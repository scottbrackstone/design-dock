# AGENTS.md

## Product

This repository is DesignDock, a personal AI design workbench for generating, editing, refining, and exporting UI designs.

The product flow is:

1. User enters a design prompt.
2. AI or mock generator returns a structured DesignSpec JSON object.
3. The app renders the DesignSpec using trusted local React components.
4. User edits the rendered design through local controls.
5. User can ask AI for selected-node or whole-design refinements.
6. User can export JSON, React/Tailwind code, and a coding-agent handoff prompt.

## Non-negotiable architecture rules

- Do not execute arbitrary AI-generated React, JavaScript, or HTML in the browser.
- AI output must be structured JSON matching the DesignSpec schema.
- Validate AI output with Zod before using it.
- The DesignSpec is the source of truth.
- Manual edits must update local state without calling an LLM.
- Use local editing for colours, fonts, spacing, radius, alignment, duplication, deletion, and ordering.
- Use AI only for generation, selected-node refinement, whole-design refinement, and export assistance.
- Keep code export deterministic where possible.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Zod
- localStorage for MVP persistence
- Optional OpenAI API integration
- Mock generator fallback when no API key exists

## Code quality rules

- Keep components small and named clearly.
- Prefer pure functions in lib/ for design transformations.
- Do not put complex design mutation logic directly inside React components.
- Avoid unnecessary dependencies.
- Avoid any-types where practical.
- Use accessible labels for form controls.
- Ensure generated UI is responsive.
- Keep the app working without an API key.

## Required commands

After changes, run available checks:

- npm run lint, if configured
- npm run typecheck, if configured
- npm run build

If a command does not exist, either add it if sensible or explain that it was unavailable.

## MVP acceptance criteria

- User can enter a prompt and generate a design.
- A mock design appears without an API key.
- The design is rendered as editable sections and elements.
- User can select sections/elements.
- Right inspector shows controls for the selected item.
- User can change colours, font sizes, spacing, radius, and alignment.
- User can save and switch versions.
- User can copy/export DesignSpec JSON.
- User can copy/export React + Tailwind code.
- No arbitrary generated code is executed in the browser.

Before writing or changing code, read these files:

1. `PROJECT_BRIEF.md`
2. `PROJECT_ARCHITECTURE.md`
3. `ARCHITECTURE_RULEBOOK_FOR_CODEX.md`
4. `TECHNOLOGY_DECISION_TEMPLATE.md`

If any of these files are missing, stop and ask whether they should be created before coding.

Do not start feature implementation until the project brief, architecture rules, and technology decision rules are understood.