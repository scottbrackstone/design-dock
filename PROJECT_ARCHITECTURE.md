# DesignDock Project Architecture

## Purpose of this document

This file describes the intended technical architecture for DesignDock.

Use this document with:

- `AGENTS.md` for permanent coding rules and repo behaviour
- `PROJECT_BRIEF.md` for the product scope and MVP goals
- `docs/ROADMAP.md` for future phases and improvements

This document is focused on the MVP architecture. It should help the coding agent avoid fragile code, oversized files, arbitrary AI-generated code execution, and unclear data flow.

---

# 1. Product architecture summary

DesignDock is an AI-assisted design workbench.

The core flow is:

```text
Prompt
  → AI or mock generator creates DesignSpec JSON
  → App validates DesignSpec
  → App renders DesignSpec using trusted local React components
  → User edits design locally through canvas/inspector controls
  → User saves versions
  → User exports JSON, React/Tailwind code, and coding-agent handoff prompt
```

The most important architectural decision is:

> The DesignSpec JSON is the source of truth.

The app should never rely on arbitrary AI-generated React, JavaScript, or HTML being executed in the browser.

---

# 2. Non-negotiable architecture rules

## 2.1 Do not execute arbitrary generated code

AI output must not be executed directly.

Do not do this:

```tsx
// Do not build this kind of feature in the MVP.
eval(aiGeneratedCode)
```

Do not dynamically run model-generated React components in the preview.

Instead, the AI should return structured JSON matching the app's `DesignSpec` schema. The local renderer should turn that safe schema into UI.

## 2.2 Validate AI output before use

Any AI-generated DesignSpec must be validated before it reaches the editor state.

Use Zod schemas for runtime validation.

Recommended flow:

```text
AI response
  → parse JSON
  → validate with Zod
  → normalise defaults
  → store in app state
  → render
```

If validation fails, return a friendly error or fallback to a mock DesignSpec.

## 2.3 Manual editing should not call the LLM

The following actions should update local state only:

- Change text
- Change colours
- Change font size
- Change font family
- Change padding
- Change gap
- Change border radius
- Change shadow
- Change alignment
- Toggle light/dark
- Move section up/down
- Duplicate selected item
- Delete selected item
- Save version
- Restore version

AI should only be used for:

- Initial generation
- Whole-design refinement
- Selected-node refinement
- Export assistance, if needed later

## 2.4 Keep mutation logic outside React components

React components should not contain large nested object mutation logic.

Put design transformation functions in:

```text
lib/design-actions.ts
```

Examples:

```ts
updateNodeStyle()
updateNodeContent()
moveSection()
duplicateNode()
deleteNode()
replaceNode()
changeTheme()
```

Components should call these actions rather than manually editing nested structures.

## 2.5 Keep files small and focused

Avoid god files.

A file should usually have one responsibility:

- schema definition
- mock generation
- rendering
- inspector controls
- storage
- export
- AI provider
- local state

If a file becomes large, split it by feature or node type.

---

# 3. Recommended MVP folder structure

Use this as the preferred structure unless there is a strong reason to change it.

```text
designdock/
  app/
    layout.tsx
    page.tsx
    globals.css

    api/
      generate-design/
        route.ts
      refine-design/
        route.ts

  components/
    app-shell/
      AppShell.tsx
      LeftPanel.tsx
      CanvasPanel.tsx
      RightInspector.tsx
      TopToolbar.tsx

    editor/
      PromptBox.tsx
      RefinementBox.tsx
      VersionHistory.tsx
      ExportPanel.tsx
      DesignSystemPicker.tsx

    canvas/
      DesignCanvas.tsx
      CanvasViewport.tsx
      SelectionOverlay.tsx
      BreakpointToggle.tsx

    inspector/
      InspectorPanel.tsx
      PageInspector.tsx
      SectionInspector.tsx
      TextInspector.tsx
      ButtonInspector.tsx
      CardInspector.tsx
      SliderControl.tsx
      ColorControl.tsx
      FontControl.tsx
      SelectControl.tsx

    design-renderer/
      DesignRenderer.tsx
      RenderSection.tsx
      RenderElement.tsx
      sections/
        HeaderSection.tsx
        HeroSection.tsx
        FeatureSection.tsx
        GallerySection.tsx
        StatsSection.tsx
        CTASection.tsx
        FooterSection.tsx
      primitives/
        TextBlock.tsx
        ButtonBlock.tsx
        CardBlock.tsx
        ImagePlaceholder.tsx
        StatBlock.tsx

    ui/
      Button.tsx
      Input.tsx
      Textarea.tsx
      Panel.tsx
      Tabs.tsx

  lib/
    design-schema.ts
    design-schema-zod.ts
    design-defaults.ts
    design-actions.ts
    mock-generator.ts
    ai-provider.ts
    export-react.ts
    export-handoff.ts
    storage.ts
    ids.ts
    tailwind-utils.ts
    token-budget.ts

  store/
    useDesignStore.ts

  docs/
    ROADMAP.md

  AGENTS.md
  PROJECT_BRIEF.md
  PROJECT_ARCHITECTURE.md
  README.md
  .env.example
```

The coding agent may simplify this structure during the first scaffold, but it should preserve the separation of concerns.

---

# 4. Main architectural layers

DesignDock should be organised into six main layers.

```text
UI Shell
  → Editor State
  → Design Actions
  → DesignSpec Schema
  → Renderer
  → AI / Mock Generation
  → Export
```

## 4.1 UI shell layer

Responsible for the visible editor interface.

Includes:

- Three-panel layout
- Prompt input
- Canvas area
- Inspector panel
- Version history
- Export buttons

This layer should not know the deep details of how to mutate nested design objects.

## 4.2 Editor state layer

Responsible for current project state.

Recommended state values:

```ts
currentProject
activeVersionId
currentSpec
selectedNodeId
selectedNodePath
viewport
isGenerating
error
```

The state layer should expose actions such as:

```ts
generateDesign(prompt)
refineDesign(instruction)
selectNode(nodeId)
clearSelection()
applyLocalEdit(action)
saveVersion(name)
restoreVersion(versionId)
copyJson()
copyReactCode()
```

## 4.3 Design actions layer

Responsible for pure updates to the DesignSpec.

This is where most local edits should happen.

Examples:

```ts
updateNodeStyle(spec, nodeId, patch)
updateNodeContent(spec, nodeId, patch)
moveSection(spec, sectionId, direction)
duplicateNode(spec, nodeId)
deleteNode(spec, nodeId)
replaceNode(spec, nodeId, replacement)
changeTheme(spec, theme)
```

These functions should:

- be deterministic
- return a new updated spec
- avoid mutating the input object directly
- be easy to test later

## 4.4 Schema layer

Responsible for TypeScript types and runtime validation.

Files:

```text
lib/design-schema.ts
lib/design-schema-zod.ts
```

The TypeScript types define the shape of the design model.

The Zod schemas validate data at runtime, especially AI responses.

## 4.5 Renderer layer

Responsible for turning a DesignSpec into visible UI.

Files:

```text
components/design-renderer/
```

The renderer should:

- receive a valid DesignSpec
- render trusted local components
- attach `data-node-id` attributes for selection
- call `onSelectNode(nodeId)` when a section/element is clicked
- never execute arbitrary code from the DesignSpec

## 4.6 AI and mock generation layer

Responsible for creating or refining DesignSpec objects.

Files:

```text
lib/ai-provider.ts
lib/mock-generator.ts
app/api/generate-design/route.ts
app/api/refine-design/route.ts
```

The app must work with or without an API key.

If `OPENAI_API_KEY` exists, the route may call the AI provider.

If `OPENAI_API_KEY` does not exist, the route must return a high-quality mock DesignSpec.

## 4.7 Export layer

Responsible for converting the current DesignSpec into useful output.

Files:

```text
lib/export-react.ts
lib/export-handoff.ts
```

Exports should include:

- DesignSpec JSON
- React/Tailwind code string
- Coding-agent handoff prompt

---

# 5. DesignSpec model

The DesignSpec is the source of truth.

A DesignSpec should describe the structure, style, and editable properties of a UI design.

## 5.1 Top-level objects

Recommended top-level types:

```ts
export type DesignProject = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  designSystemId?: string;
  versions: DesignVersion[];
  activeVersionId: string;
};

export type DesignVersion = {
  id: string;
  name: string;
  createdAt: string;
  prompt: string;
  refinementPrompt?: string;
  spec: DesignSpec;
  notes?: string;
};

export type DesignSpec = {
  id: string;
  title: string;
  description: string;
  kind: "landing-page" | "dashboard" | "form" | "gallery" | "settings" | "app-screen";
  theme: "light" | "dark";
  viewport: "desktop" | "tablet" | "mobile";
  designSystem: DesignSystemSnapshot;
  page: PageNode;
};
```

## 5.2 Page and sections

```ts
export type PageNode = {
  id: string;
  type: "page";
  name: string;
  style: PageStyle;
  sections: SectionNode[];
};

export type SectionNode = {
  id: string;
  type:
    | "header"
    | "hero"
    | "features"
    | "gallery"
    | "stats"
    | "testimonials"
    | "pricing"
    | "cta"
    | "footer"
    | "custom";
  name: string;
  layout: SectionLayout;
  style: SectionStyle;
  elements: ElementNode[];
};
```

## 5.3 Elements

```ts
export type ElementNode =
  | TextElement
  | ButtonElement
  | CardElement
  | ImageElement
  | StatElement
  | BadgeElement
  | DividerElement;
```

Example text element:

```ts
export type TextElement = {
  id: string;
  type: "text";
  role: "eyebrow" | "heading" | "subheading" | "body" | "caption";
  content: string;
  style: TextStyle;
};
```

Example button element:

```ts
export type ButtonElement = {
  id: string;
  type: "button";
  label: string;
  href?: string;
  variant: "primary" | "secondary" | "ghost" | "outline";
  style: ButtonStyle;
};
```

Example card element:

```ts
export type CardElement = {
  id: string;
  type: "card";
  title: string;
  body: string;
  image?: ImageElement;
  style: CardStyle;
};
```

---

# 6. Style model

The style model should be simple enough to render reliably, but detailed enough for inspector controls.

## 6.1 Section style

```ts
export type SectionStyle = {
  backgroundType: "solid" | "gradient" | "image" | "transparent";
  backgroundColor?: string;
  gradientFrom?: string;
  gradientTo?: string;
  paddingTop: number;
  paddingBottom: number;
  paddingX: number;
  gap: number;
  maxWidth: number;
  borderRadius: number;
  shadow: "none" | "sm" | "md" | "lg" | "xl";
  borderColor?: string;
};
```

## 6.2 Text style

```ts
export type TextStyle = {
  fontFamily: string;
  fontSize: number;
  fontWeight: number;
  lineHeight: number;
  letterSpacing: number;
  color: string;
  align: "left" | "center" | "right";
  maxWidth?: number;
};
```

## 6.3 Button style

```ts
export type ButtonStyle = {
  backgroundColor: string;
  textColor: string;
  borderColor?: string;
  radius: number;
  paddingX: number;
  paddingY: number;
  fontSize: number;
  fontWeight: number;
};
```

## 6.4 Card style

```ts
export type CardStyle = {
  backgroundColor: string;
  borderColor?: string;
  radius: number;
  shadow: "none" | "sm" | "md" | "lg" | "xl";
  padding: number;
  width?: number;
  minHeight?: number;
};
```

---

# 7. Rendering architecture

The renderer should map the DesignSpec to local React components.

Example flow:

```text
DesignRenderer
  → RenderSection
    → HeaderSection
    → HeroSection
    → FeatureSection
    → GallerySection
    → StatsSection
    → CTASection
    → FooterSection
      → RenderElement
        → TextBlock
        → ButtonBlock
        → CardBlock
        → ImagePlaceholder
        → StatBlock
```

The renderer should not contain editor form controls. It should only render the design and expose selection hooks.

## 7.1 Selectable nodes

Every rendered node should expose a node id:

```tsx
<section data-node-id={section.id} data-node-type={section.type}>
```

For child elements:

```tsx
<div data-node-id={element.id} data-node-type={element.type}>
```

Click handling should prevent parent nodes from overriding child selections.

Example:

```tsx
onClick={(event) => {
  event.stopPropagation();
  onSelectNode(element.id);
}}
```

## 7.2 Selected state

The selected node should have a visible outline in the canvas.

Recommended selected styles:

```text
outline
small label
subtle hover state
clear selected border
```

Do not make the selected styles part of the exported design. They are editor-only overlays.

---

# 8. Inspector architecture

The inspector should render different controls based on the selected node type.

```text
No selection
  → PageInspector

Selected section
  → SectionInspector

Selected text element
  → TextInspector

Selected button element
  → ButtonInspector

Selected card element
  → CardInspector
```

Each inspector should:

- receive the selected node
- render relevant controls
- call design action helpers when values change
- avoid deep mutation inside the component

Example control flow:

```text
User changes font size slider
  → TextInspector calls updateNodeStyle(spec, nodeId, { fontSize: value })
  → Store updates currentSpec
  → Canvas rerenders
```

---

# 9. State architecture

Use a central store for editor state.

Recommended file:

```text
store/useDesignStore.ts
```

Zustand is acceptable, but React state/context is also acceptable for the MVP.

Recommended state shape:

```ts
type DesignEditorState = {
  project: DesignProject | null;
  currentSpec: DesignSpec | null;
  selectedNodeId: string | null;
  viewport: "desktop" | "tablet" | "mobile";
  isGenerating: boolean;
  isRefining: boolean;
  error: string | null;
};
```

Recommended actions:

```ts
type DesignEditorActions = {
  generateDesign: (prompt: string) => Promise<void>;
  refineDesign: (instruction: string, selectedNodeId?: string) => Promise<void>;
  selectNode: (nodeId: string) => void;
  clearSelection: () => void;
  applySpec: (spec: DesignSpec) => void;
  updateSelectedNode: (patch: unknown) => void;
  saveVersion: (name?: string) => void;
  restoreVersion: (versionId: string) => void;
  setViewport: (viewport: "desktop" | "tablet" | "mobile") => void;
};
```

For the MVP, keep the state model simple. Do not build a complex document engine unless needed.

---

# 10. Persistence architecture

For the MVP, use localStorage.

Recommended file:

```text
lib/storage.ts
```

Recommended keys:

```ts
const STORAGE_KEYS = {
  currentProject: "designdock.currentProject",
  activeVersionId: "designdock.activeVersionId",
  designSystems: "designdock.designSystems",
};
```

Storage helpers:

```ts
saveProject(project)
loadProject()
clearProject()
saveDesignSystems(systems)
loadDesignSystems()
```

Storage code should be isolated so Supabase can be added later without rewriting the editor.

Future persistence should add a repository-like interface:

```ts
interface ProjectRepository {
  saveProject(project: DesignProject): Promise<void>;
  loadProject(projectId: string): Promise<DesignProject | null>;
  listProjects(): Promise<DesignProject[]>;
}
```

The localStorage implementation can be replaced or supplemented by Supabase later.

---

# 11. AI architecture

## 11.1 API routes

Use internal API routes for generation and refinement.

```text
POST /api/generate-design
POST /api/refine-design
```

Frontend components should not call the model provider directly.

## 11.2 Generate design route

Input:

```ts
{
  prompt: string;
  designSystem?: DesignSystemSnapshot;
  outputKind?: "landing-page" | "dashboard" | "app-screen";
}
```

Output:

```ts
{
  spec: DesignSpec;
}
```

Behaviour:

```text
If OPENAI_API_KEY exists:
  call AI provider
  request structured DesignSpec JSON
  validate result with Zod
  return valid spec

If OPENAI_API_KEY missing:
  return mock DesignSpec
```

## 11.3 Refine design route

Input:

```ts
{
  instruction: string;
  currentSpec: DesignSpec;
  selectedNodeId?: string;
}
```

Output:

```ts
{
  spec: DesignSpec;
  summary: string;
}
```

Behaviour:

```text
If selectedNodeId exists:
  prefer selected-node refinement
  update only that node where possible

If no selectedNodeId:
  refine the whole design
```

For the MVP, mock refinement can make simple deterministic changes such as:

- increase spacing
- change theme
- improve heading copy
- adjust colours
- add subtle shadows

## 11.4 AI provider isolation

The OpenAI-specific code should live in:

```text
lib/ai-provider.ts
```

Do not spread provider-specific code throughout the app.

This makes it easier to swap or add providers later.

---

# 12. Token-saving architecture

DesignDock should be designed to avoid unnecessary LLM calls.

## 12.1 Local edits cost no tokens

Any inspector change should mutate local state only.

Examples:

```text
paddingTop 80 → 120
fontSize 48 → 56
backgroundColor #111827 → #020617
button radius 12 → 999
```

These are pure state updates.

## 12.2 Selected-node refinement should send minimal context

When refining one selected element, do not send the full DesignSpec unless necessary.

Create a helper:

```text
lib/token-budget.ts
```

Recommended functions:

```ts
compactDesignSpec(spec)
getSelectedNodeContext(spec, nodeId)
buildSelectedNodeRefinementPayload(spec, nodeId, instruction)
```

A selected-node payload should include:

- selected node
- parent section summary
- page title
- design system rules
- short user instruction

## 12.3 Whole-design refinement is allowed but should be intentional

Whole-design refinement can send the full spec in the MVP if the spec is small.

Later, compact it if projects become large.

---

# 13. Export architecture

The MVP should support deterministic export.

Files:

```text
lib/export-react.ts
lib/export-handoff.ts
```

## 13.1 JSON export

The JSON export is simply the current validated DesignSpec.

## 13.2 React/Tailwind export

The React export should convert the DesignSpec into a readable component string.

The first version does not need to be perfect production code, but it should be useful.

Recommended output:

```tsx
export default function GeneratedDesign() {
  return (
    <main>
      {/* sections generated from DesignSpec */}
    </main>
  );
}
```

Prioritise:

- readability
- valid JSX
- sensible Tailwind classes
- section comments
- easy paste into a Next.js project

## 13.3 Coding-agent handoff prompt

Generate a handoff prompt that explains:

- product intent
- design source of truth
- target stack
- implementation instructions
- accessibility reminders
- responsive behaviour expectations

Example:

```text
You are implementing a UI generated in DesignDock.
Use the attached DesignSpec JSON as the source of truth.
Build this as a Next.js App Router page using TypeScript and Tailwind CSS.
Preserve layout, spacing, typography, colours, and responsive behaviour.
Do not add unnecessary dependencies.
Run lint, typecheck, and build before finishing.
```

---

# 14. Design system architecture

The MVP can start with one default design system.

Later it should support multiple presets.

Recommended default:

```text
Premium SaaS
```

Design system snapshot:

```ts
export type DesignSystemSnapshot = {
  id: string;
  name: string;
  tokens: DesignTokens;
  rules: DesignSystemRules;
};
```

Design tokens:

```ts
export type DesignTokens = {
  colors: {
    background: string;
    foreground: string;
    muted: string;
    primary: string;
    secondary: string;
    accent: string;
    border: string;
    card: string;
  };
  typography: {
    headingFont: string;
    bodyFont: string;
    monoFont?: string;
  };
  radius: {
    sm: number;
    md: number;
    lg: number;
    xl: number;
    full: number;
  };
};
```

Design system rules:

```ts
export type DesignSystemRules = {
  visualTone: string;
  layoutRules: string[];
  accessibilityRules: string[];
  avoid: string[];
  preferredPatterns: string[];
};
```

For MVP, design systems do not need full import/export.

---

# 15. MVP component responsibilities

## AppShell

Owns the high-level layout.

Should render:

- LeftPanel
- CanvasPanel
- RightInspector

Should not contain detailed business logic.

## LeftPanel

Owns:

- prompt input
- generate button
- refinement input
- version history
- export buttons

Should call store actions.

## CanvasPanel

Owns:

- canvas toolbar
- viewport toggle
- scrollable preview area
- DesignCanvas

## DesignCanvas

Owns:

- rendering the current DesignSpec
- passing selection callbacks to DesignRenderer
- showing empty/loading/error states

## DesignRenderer

Owns:

- mapping spec sections to section components
- mapping section elements to primitive components
- attaching node IDs for selection

## RightInspector

Owns:

- choosing the correct inspector based on selected node type
- showing page inspector when nothing is selected

## Inspector controls

Reusable controls should live in:

```text
components/inspector/
```

Examples:

- SliderControl
- ColorControl
- FontControl
- SelectControl

---

# 16. Error handling

The app should handle common failures clearly.

## Generation errors

If generation fails:

- show an error message
- keep previous design if one exists
- allow user to try again

## Invalid AI output

If AI output fails validation:

- do not use it
- show a validation error
- optionally use mock fallback

## Storage errors

If localStorage fails:

- app should still work in memory
- show a small warning only if needed

## Export errors

If export fails:

- show a friendly error
- do not crash the app

---

# 17. Accessibility expectations

The app itself should be accessible enough for normal use.

Requirements:

- Inputs have labels
- Buttons have clear text
- Sliders have labels
- Colour controls have labels
- Keyboard users can tab through controls
- Canvas selection should not be mouse-only forever, though MVP can start mouse-first
- Export buttons should use clear labels

Generated designs should aim for:

- readable text sizes
- sensible contrast
- clear buttons
- semantic structure where possible

---

# 18. Styling approach

Use Tailwind CSS.

Keep editor UI styling separate from generated design styling.

There are two visual layers:

## 18.1 Editor chrome

The DesignDock interface:

- panels
- toolbar
- buttons
- inputs
- inspector controls
- version list

## 18.2 Generated design preview

The user-generated design:

- sections
- cards
- headings
- CTAs
- gallery placeholders
- footer

Editor overlays such as selection outlines should not become part of export output.

---

# 19. Build and quality checks

After meaningful changes, run available checks.

Preferred commands:

```bash
npm run lint
npm run typecheck
npm run build
```

If a command does not exist, either add it if sensible or state that it was unavailable.

The app should build successfully before a task is considered complete.

---

# 20. MVP acceptance criteria

The MVP architecture is successful when:

- The app runs locally.
- The app builds successfully.
- The app works without an API key.
- User can enter a prompt and generate a mock design.
- The generated design renders in the canvas.
- User can click/select sections and elements.
- Right inspector changes based on selected node type.
- User can change text, colours, fonts, spacing, radius, shadows, alignment, and layout locally.
- Local edits do not call the LLM.
- User can save and switch versions.
- User can copy/export DesignSpec JSON.
- User can copy/export React/Tailwind code.
- User can copy a coding-agent handoff prompt.
- No arbitrary AI-generated code is executed in the browser.

---

# 21. What not to build in the MVP

Do not build these yet:

- Full freeform Figma-style infinite canvas
- Realtime multiplayer
- Supabase persistence
- Auth
- Payments
- Figma import/export
- GitHub repo ingestion
- Design-system extraction from codebases
- Canva/Adobe integrations
- Complex animation editor
- Slide deck generator
- Full production code generation engine

These belong in the roadmap after the core loop works.

---

# 22. Recommended first implementation order

The coding agent should build in this order:

```text
1. Project scaffold and Tailwind setup
2. AGENTS.md / README / env example alignment
3. DesignSpec TypeScript types
4. Zod schemas
5. Mock generator
6. App shell layout
7. Design renderer
8. Canvas selection
9. Inspector controls
10. Local design actions
11. localStorage persistence
12. Version history
13. Export JSON
14. Export React/Tailwind
15. Optional AI provider integration
16. Refine route
17. Build/typecheck fixes
```

Avoid jumping ahead to future features until this loop works.

---

# 23. Simple mental model

Think of DesignDock like this:

```text
DesignSpec = database of the design
Renderer = turns the design database into a preview
Inspector = edits the design database
AI = creates or improves the design database
Exporter = turns the design database into code/text
```

If a feature does not fit this model, question whether it belongs in the MVP.
