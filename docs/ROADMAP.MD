# DesignDock Roadmap

## Purpose of this roadmap

This roadmap describes the staged build plan for DesignDock.

DesignDock is a personal AI design workbench for generating, editing, refining, and exporting website/app UI designs.

The product should grow in controlled phases. The first goal is not to build a full Figma replacement or a full Claude Design clone. The first goal is to prove the core loop:

Prompt → DesignSpec JSON → editable canvas → local visual controls → versions → React/Tailwind export.

This roadmap should guide future work after the MVP foundation is complete.

---

# Core product direction

DesignDock should become a token-efficient visual design workbench.

The main idea is that the AI creates or refines structured design data, while normal visual adjustments happen locally without calling an LLM.

## Non-negotiable product principles

- The DesignSpec JSON is the source of truth.
- The app must not execute arbitrary AI-generated React, JavaScript, or HTML in the browser.
- AI output must be validated before it is used.
- Manual edits should not use model tokens.
- Local editing should cover colours, fonts, spacing, radius, shadows, alignment, ordering, duplication, deletion, and text updates.
- AI should be used for generation, selected-node refinement, whole-design refinement, design-system application, accessibility review, and export assistance.
- The app should stay useful without an API key by using mock generation.
- The MVP should remain simple, local-first, and easy to understand.

---

# Phase 0 — Project setup

## Goal

Create the foundation for the app and make sure the repository has clear rules for future coding-agent work.

## Build

- Next.js App Router project
- TypeScript
- Tailwind CSS
- Basic app shell
- Three-panel editor layout
- `AGENTS.md`
- `PROJECT_BRIEF.md`
- `README.md`
- `.env.example`

## Acceptance criteria

- `npm install` works.
- `npm run dev` works.
- `npm run build` works.
- The app shows a three-panel layout.
- No AI integration is required yet.
- The architecture follows `AGENTS.md`.

---

# Phase 1 — Design schema and mock generator

## Goal

Create the structured data model that powers the whole app.

The app should be able to generate a mock DesignSpec without any external AI service.

## Build

- `DesignProject` type
- `DesignVersion` type
- `DesignSpec` type
- `DesignSystem` type
- `PageNode` type
- `SectionNode` type
- `ElementNode` union
- `TextElement`
- `ButtonElement`
- `CardElement`
- `ImageElement`
- `StatElement`
- Zod schemas for validation
- Mock generator that returns a complete DesignSpec
- LocalStorage save/load helpers
- Version creation and switching

## Acceptance criteria

- User can click Generate.
- The app creates a mock DesignSpec based on the user prompt.
- The generated spec is valid according to the Zod schema.
- The current project is saved to localStorage.
- User can save and switch versions.

---

# Phase 2 — Design renderer

## Goal

Render the DesignSpec into a polished UI preview using trusted local React components.

## Build

- `DesignRenderer`
- `RenderSection`
- `RenderElement`
- Header renderer
- Hero renderer
- Features renderer
- Gallery renderer
- Stats renderer
- CTA renderer
- Footer renderer
- Primitive renderers for text, buttons, cards, images, and stats
- Light/dark theme support
- Responsive preview support

## Acceptance criteria

- Generated specs render as a complete page.
- The design looks clean and modern by default.
- Layout uses good spacing, hierarchy, cards, rounded corners, and subtle borders.
- Light/dark preview works.
- Desktop/tablet/mobile preview modes are available, even if basic.

---

# Phase 3 — Selection and inspector

## Goal

Let the user click the rendered design and edit the selected section or element.

## Build

- Click/select support on sections and elements
- `selectedNodeId` state
- Selected-state outline
- Hover outline
- Node label for selected item
- Right-side inspector
- Page inspector
- Section inspector
- Text inspector
- Button inspector
- Card inspector
- Element path or breadcrumb display

## Acceptance criteria

- User can click a section and see section controls.
- User can click a text element and see text controls.
- User can click a button and see button controls.
- User can click a card and see card controls.
- Child element clicks do not accidentally select the parent section.
- Escape key clears the selection.

---

# Phase 4 — Local visual editing controls

## Goal

Allow common visual changes without calling an AI model.

This phase is critical for keeping token usage down.

## Build

- Text content input
- Font family select
- Font size slider
- Font weight select
- Line height control
- Letter spacing control
- Text colour input
- Background colour input
- Padding top slider
- Padding bottom slider
- Padding X slider
- Gap slider
- Border radius slider
- Shadow selector
- Alignment controls
- Section layout selector
- Button variant selector
- Button padding controls
- Move section up/down
- Duplicate selected item
- Delete selected item

## Acceptance criteria

- User can visually alter the generated design without using AI.
- Canvas updates instantly when inspector controls change.
- Changes persist to the current project state.
- User can save the edited state as a version.
- Local editing logic is implemented through pure functions in `lib/design-actions.ts`.

---

# Phase 5 — AI generation

## Goal

Add real AI-backed DesignSpec generation while keeping mock generation as a fallback.

## Build

- `lib/ai-provider.ts`
- `POST /api/generate-design`
- Prompt construction for DesignSpec generation
- Structured JSON response handling
- Zod validation of AI output
- Mock generator fallback when `OPENAI_API_KEY` is missing
- Loading state
- Error state
- Safe handling of invalid AI responses

## Acceptance criteria

- With `OPENAI_API_KEY`, the app can generate a real AI DesignSpec.
- Without `OPENAI_API_KEY`, the app still works using mock generation.
- Invalid AI output does not crash the app.
- AI output is validated before being rendered.
- The app never executes AI-generated code.

---

# Phase 6 — AI refinement

## Goal

Allow the user to refine either the whole design or only a selected node.

## Build

- `POST /api/refine-design`
- Whole-design refinement
- Selected-node refinement
- Compact design summary helper
- Selected-node context extraction
- Mock refinement fallback
- Version creation after AI refinement
- Summary of AI changes

## Refinement types

### Whole-design refinement

Examples:

- Make this landing page more premium.
- Make the whole design darker and more modern.
- Turn this into a mobile-first design.
- Improve the information hierarchy.

### Selected-node refinement

Examples:

- Make this hero headline stronger.
- Make this CTA section more persuasive.
- Improve this pricing card.
- Make this feature section more compact.

## Acceptance criteria

- User can refine the full design.
- User can select a node and refine only that node.
- Selected-node refinement sends minimal context where possible.
- A new version is created after AI refinement.
- Mock refinement works without an API key.

---

# Phase 7 — Export system

## Goal

Make DesignDock useful as a handoff tool for implementation.

## Build

- Copy DesignSpec JSON
- Download DesignSpec JSON
- Copy React/Tailwind component code
- Download `.tsx` export
- Generate coding-agent handoff prompt
- Export notes explaining assumptions and limitations

## Export bundle should include

- Current DesignSpec JSON
- React/Tailwind component string
- Suggested file path
- Implementation prompt for Codex or another coding agent
- Notes about theme, layout, responsiveness, and accessibility

## Acceptance criteria

- User can copy JSON.
- User can copy React/Tailwind code.
- User can generate a coding-agent handoff prompt.
- Exported code is readable.
- Exported code visually resembles the canvas.
- Export does not require an AI call unless the user asks for AI-assisted export.

---

# Phase 8 — Design systems

## Goal

Make generated designs less generic by grounding them in reusable design systems.

## Build

- Design system model
- Design system picker
- Predefined design systems
- Design token editor
- Save custom design system locally
- Apply design system to current project
- Use selected design system during AI generation and refinement

## Initial predefined design systems

1. Premium SaaS
2. Vercel/Linear Dark
3. Apple-like Minimal
4. Warm Creator Brand
5. Bold Startup Landing
6. Mobile App Clean

## Design system fields

- Colour palette
- Heading font
- Body font
- Spacing scale
- Radius scale
- Shadow scale
- Button styles
- Card styles
- Layout rules
- Accessibility rules
- Visual tone
- Things to avoid

## Acceptance criteria

- User can choose a design system before generation.
- Mock generator changes visually based on the selected design system.
- AI generation includes design system context.
- User can edit at least basic tokens: colours, radius, and fonts.
- Selected design system persists locally.

---

# Phase 9 — Better canvas editing

## Goal

Improve the visual editing experience after the structured inspector is working.

## Build

- Drag to reorder sections
- Resize handles for cards and images
- Snap-to-grid behaviour
- Alignment guides
- Canvas zoom
- Keyboard shortcuts
- Undo/redo
- More precise hover/selection layers

## Recommended order

1. Undo/redo
2. Keyboard shortcuts
3. Drag section reorder
4. Resize handles
5. Snap guides
6. Canvas zoom

## Acceptance criteria

- User can reorder sections by dragging.
- User can resize selected cards/images with handles.
- User can undo and redo local edits.
- Editing still updates the DesignSpec as the source of truth.
- No arbitrary generated code is executed.

---

# Phase 10 — Responsive design system

## Goal

Support separate desktop, tablet, and mobile layout decisions.

## Build

- Per-breakpoint style overrides
- Breakpoint-specific inspector controls
- Mobile layout generation
- Tablet layout generation
- Responsive export improvements
- Preview mode sync with current breakpoint

## Acceptance criteria

- User can switch between desktop, tablet, and mobile.
- User can make breakpoint-specific edits.
- Exported React/Tailwind code includes responsive classes.
- AI can generate or refine mobile-specific layouts.

---

# Phase 11 — Screenshot/image input

## Goal

Allow the user to create an editable DesignSpec from a visual reference.

## Build

- Upload screenshot or image reference
- Send image to AI provider where supported
- Infer layout structure
- Generate editable DesignSpec from image
- Display confidence/notes about inferred structure

## Acceptance criteria

- User can upload a screenshot.
- App generates an editable approximation.
- Output is still a DesignSpec, not a flat image.
- User can edit the generated design with normal inspector controls.

---

# Phase 12 — Repo/design-system import

## Goal

Allow DesignDock to use real project styles and components as design-system context.

## Build

- Import Tailwind config
- Import CSS variables
- Import global styles
- Import example components
- Scan selected folders only
- Summarise design patterns
- Create a DesignSystem from imported files

## Important limits

Do not ingest entire large repositories by default.

Prefer focused imports from:

- `components/`
- `app/`
- `styles/`
- `tailwind.config.*`
- `theme.*`
- design token files

## Acceptance criteria

- User can import a small set of project files.
- App can infer basic colours, typography, spacing, and component patterns.
- Imported design system can be selected for generation.
- Large or invalid imports fail gracefully.

---

# Phase 13 — Multi-screen prototypes

## Goal

Move from single-page design generation to simple interactive product flows.

## Build

- Multiple screens per project
- Screen list
- Links between screens
- Prototype mode
- Clickable navigation
- Flow map
- Export multi-screen handoff bundle

## Example flows

- Landing page → Sign up → Dashboard
- Event gallery → Upload page → Admin page
- Onboarding step 1 → step 2 → success
- App home → detail screen → settings

## Acceptance criteria

- User can create multiple screens.
- User can link buttons/cards to other screens.
- Prototype mode lets the user click through the flow.
- Export includes all screens and route suggestions.

---

# Phase 14 — Comments and review

## Goal

Support lightweight review without building realtime multiplayer.

## Build

- Comments attached to node IDs
- Comment panel
- Resolve/unresolve comments
- Filter comments by screen/version
- Shareable read-only export or review mode

## Acceptance criteria

- User can attach a comment to a selected node.
- Comments persist with the project.
- Resolved comments can be hidden.
- Comments survive version switching where the node still exists.

---

# Phase 15 — Supabase persistence

## Goal

Move from local-only projects to cloud persistence.

## Build

- Supabase client setup
- Database schema
- Project save/load
- Version save/load
- Design system save/load
- LocalStorage fallback
- Optional auth later

## Suggested tables

```sql
profiles
  id
  email
  display_name
  created_at

design_projects
  id
  owner_id
  name
  description
  active_version_id
  design_system_id
  created_at
  updated_at

design_versions
  id
  project_id
  name
  prompt
  refinement_prompt
  spec_json
  created_at

design_systems
  id
  owner_id
  name
  description
  tokens_json
  rules_json
  created_at
  updated_at

design_comments
  id
  project_id
  version_id
  node_id
  body
  status
  created_at
  resolved_at

design_exports
  id
  project_id
  version_id
  export_type
  file_path
  created_at
```

## Acceptance criteria

- App works with Supabase when environment variables exist.
- App falls back to localStorage when Supabase variables are missing.
- Existing local projects are not lost.
- Version history persists across devices after auth is added.

---

# Phase 16 — Advanced code handoff

## Goal

Make exported output easier for a coding agent to implement in a real app.

## Build

- Export Next.js App Router page
- Export component folder
- Export Tailwind theme notes
- Export design tokens
- Export README for implementation
- Export Codex prompt
- Export accessibility checklist
- Export responsive behaviour notes

## Acceptance criteria

- User can download or copy a complete implementation bundle.
- Bundle includes DesignSpec, code, and instructions.
- A coding agent can use the bundle to implement the design in a real repo.
- Export avoids unnecessary dependencies.

---

# Phase 17 — Quality, accessibility, and design review

## Goal

Help the user improve design quality before exporting.

## Build

- Accessibility review
- Colour contrast warnings
- Missing alt text warnings
- Heading hierarchy warnings
- CTA clarity check
- Layout density check
- Mobile usability check
- AI design critique

## Acceptance criteria

- User can run a design audit.
- App identifies obvious accessibility issues.
- App suggests improvements.
- User can apply some fixes locally.
- AI critique is optional and does not block local editing.

---

# Future ideas

These should not be built until the main workflow is strong.

## Possible future features

- Figma export
- Canva export
- PPTX export
- PDF export
- Standalone HTML export
- Vercel deployment handoff
- GitHub PR creation
- Design comparison view
- A/B layout generation
- Style remixing
- Brand kit import
- Component library import
- Shadcn/ui export mode
- Framer Motion animation suggestions
- User testing notes
- Client presentation mode

## Avoid until much later

- Full realtime multiplayer
- Full infinite canvas
- Full Figma replacement
- Payment system
- Team roles and permissions
- Enterprise audit logs
- Large-repo automatic ingestion
- Arbitrary generated code execution

---

# Recommended coding-agent workflow

Use small focused prompts after the initial MVP.

Each task should include:

- What to build
- What files are likely involved
- What not to change
- Acceptance criteria
- Commands to run

## Example follow-up task format

```text
Improve the DesignDock canvas selection system.

Requirements:
- Add hover outlines for selectable nodes.
- Add selected-node label showing node type and name.
- Prevent parent section clicks from overriding child element clicks.
- Add breadcrumb display for selected node path.
- Add Escape key to clear selection.
- Keep all selection state in the design store.
- Do not change the DesignSpec schema unless necessary.
- Run build/typecheck after changes.
```

---

# Suggested next tasks after MVP

After the first working MVP exists, improve in this order:

1. Canvas selection quality
2. Inspector control coverage
3. Undo/redo
4. React/Tailwind export quality
5. Design systems
6. Real AI generation quality
7. Selected-node AI refinement
8. Responsive breakpoints
9. Screenshot-to-design
10. Supabase persistence

---

# Definition of done for the core product

DesignDock reaches its first serious milestone when a user can:

1. Enter a product/UI prompt.
2. Generate a full editable UI design.
3. Click specific sections and elements.
4. Adjust the design visually without using AI.
5. Save multiple versions.
6. Ask AI for targeted improvements.
7. Export React/Tailwind code.
8. Export a coding-agent handoff prompt.
9. Use the result as a real starting point for implementation.

At that point, the product has proven its core value.
