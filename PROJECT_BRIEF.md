# DesignDock Project Brief

## Product name

DesignDock

## Product summary

DesignDock is a personal AI design workbench for generating, editing, refining, and exporting website and app UI designs.

The core idea is:

Prompt → structured editable UI design → visual canvas editing → version history → React/Tailwind export → coding-agent handoff.

DesignDock is inspired by tools like Claude Design, but the MVP should be much smaller and focused on one strong workflow: creating editable website/app UI screens that can be refined visually and exported into code.

## Target user

The first target user is a solo developer or AI-assisted builder who wants to quickly turn rough product ideas into clean UI designs before implementing them in code.

The product should help users who are not expert designers create better visual direction before asking a coding agent to build the app.

## Core problem

AI coding agents can build functional apps, but the visual design often becomes generic, inconsistent, or fragile if the user has not clearly shaped the UI first.

DesignDock solves this by letting the user generate a visual UI design, edit it manually with controls, save versions, and export a clear handoff for a coding agent.

## Core product principle

The AI must generate structured design data, not arbitrary executable code.

The app should render that structured design data using trusted local React components.

This means:

- Do not execute arbitrary AI-generated React, JavaScript, or HTML in the browser.
- The DesignSpec JSON is the source of truth.
- Manual visual edits should update local state without calling an LLM.
- AI should only be used for generation, selected-element refinement, whole-design refinement, and export assistance.

## MVP user flow

1. User opens DesignDock.
2. User enters a prompt describing a UI design.
3. The app generates a structured DesignSpec JSON object.
4. The app renders the DesignSpec as a live preview on a canvas.
5. User clicks sections or elements in the preview.
6. A right-side inspector shows controls for the selected section or element.
7. User changes colours, fonts, spacing, radius, shadows, text, and layout locally.
8. User saves versions and switches between previous versions.
9. User optionally asks AI to refine the whole design or selected item.
10. User exports DesignSpec JSON, React/Tailwind code, and a coding-agent handoff prompt.

## MVP scope

The MVP should include:

- Next.js App Router
- TypeScript
- Tailwind CSS
- Zod validation
- localStorage persistence
- Optional OpenAI API integration
- Mock generator fallback when no API key exists
- Three-panel editor layout
- Prompt input
- Generate button
- Editable preview canvas
- Click/select sections and elements
- Right-side inspector
- Version history
- Local visual editing controls
- Copy/export DesignSpec JSON
- Copy/export React/Tailwind code
- Coding-agent handoff prompt

## MVP editor layout

The app should use a three-panel interface.

Left panel:

- Project title
- Prompt input
- Generate button
- Refinement input
- Version history
- Save version button
- Export buttons

Centre panel:

- Live design preview
- Canvas toolbar
- Desktop/tablet/mobile preview toggle
- Clickable/selectable sections and elements
- Selected-state outline

Right panel:

- Inspector for selected item
- Page controls when nothing is selected
- Section controls when a section is selected
- Text controls when text is selected
- Button controls when a button is selected
- Card controls when a card is selected

## Required local editing controls

Manual controls should work without calling an AI model.

Include controls for:

- Text content
- Font family
- Font size
- Font weight
- Text colour
- Background colour
- Padding
- Gap
- Border radius
- Shadow
- Alignment
- Layout style
- Move section up/down
- Duplicate selected item
- Delete selected item

## AI behaviour

The app should support AI generation and refinement, but it must also work without an API key.

If `OPENAI_API_KEY` exists:

- Use the AI provider to generate or refine a DesignSpec.
- Validate the result with Zod before using it.

If `OPENAI_API_KEY` does not exist:

- Use a high-quality mock generator.
- The app should still feel usable.

## DesignSpec

The DesignSpec is the source of truth for the rendered design.

It should include enough structure to support selection, editing, rendering, versioning, and export.

The schema should include:

- DesignProject
- DesignVersion
- DesignSpec
- DesignSystem
- PageNode
- SectionNode
- ElementNode
- TextElement
- ButtonElement
- CardElement
- ImageElement
- StatElement

## Rendering approach

The renderer should map the DesignSpec into polished Tailwind UI using trusted local components.

The MVP should support these section types:

- Header
- Hero
- Features
- Gallery
- Stats
- CTA
- Footer

The generated designs should look clean and modern by default.

Prioritise:

- Strong visual hierarchy
- Good spacing
- Responsive layout
- Cards
- Subtle borders
- Rounded corners
- Light/dark support

## Export requirements

The MVP should let the user copy or export:

1. DesignSpec JSON
2. React/Tailwind component code
3. Coding-agent handoff prompt

The exported code does not need to be perfect production code in the MVP, but it should be readable, useful, and close enough for a coding agent to implement.

## Non-goals for MVP

Do not build these in the first version:

- Full Figma clone
- Realtime multiplayer
- Supabase persistence
- Authentication
- Payments
- Native Figma import/export
- Full GitHub repo ingestion
- Freeform infinite canvas
- Arbitrary generated-code execution
- Complex animations
- Slide deck generation
- Canva/Adobe integrations

## Initial technical stack

Use:

- Next.js App Router
- TypeScript
- Tailwind CSS
- Zod
- localStorage
- Optional OpenAI API route
- Mock generator fallback

## Success criteria

The MVP is successful when:

- The app runs locally.
- The app builds successfully.
- A user can enter a prompt and generate a design.
- The app works without an API key.
- The generated design renders in the canvas.
- The user can click sections and elements.
- The inspector updates based on the selected item.
- The user can edit colours, text, fonts, spacing, radius, shadows, and layout locally.
- The user can save and switch versions.
- The user can copy DesignSpec JSON.
- The user can copy React/Tailwind code.
- No arbitrary AI-generated code is executed in the browser.