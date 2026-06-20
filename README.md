# DesignDock

DesignDock is a personal AI design workbench for turning a prompt into a structured, editable UI design.

The MVP implements the core loop:

```text
prompt -> DesignSpec JSON -> editable canvas -> inspector controls -> version history -> export
```

## Run locally

```bash
npm install
npm run dev
```

Then open the local URL printed by Next.js.

## AI Provider Setup

DesignDock works without an API key using mock mode.

To test real generation, create `.env.local`:

```bash
cp .env.example .env.local
```

Add either DeepSeek or MiniMax credentials:

```bash
DEFAULT_AI_PROVIDER=deepseek
DEEPSEEK_API_KEY=your_key_here
```

or:

```bash
DEFAULT_AI_PROVIDER=minimax
MINIMAX_API_KEY=your_key_here
```

Never commit `.env.local`. Never expose provider keys with `NEXT_PUBLIC_` variables. The app includes a local AI provider selector for Mock, DeepSeek, and MiniMax; if a real provider is selected without a key, DesignDock shows a warning and keeps mock mode available.

Recommended generation test prompts:

- Design a landing page for a wedding photo sharing app.
- Design a landing page for a cross-device clipboard app.
- Design a mobile app landing page for a voice note app.
- Design a dashboard for tracking AI usage costs.
- Design a gallery page for reviewing event photos.

Style tests:

- Premium SaaS
- Vercel/Linear Dark
- Apple-like Minimal
- Warm Creator Brand
- Bold Startup Landing

## Architecture

The `DesignSpec` is the source of truth. AI responses are parsed as JSON and validated with Zod before they can enter editor state. The canvas never executes arbitrary AI-generated React, JavaScript, or HTML. It renders trusted local React components from structured data.

Local inspector edits update the `DesignSpec` through pure functions in `lib/design-actions.ts`; they do not call an LLM.

## Commands

```bash
npm run lint
npm run typecheck
npm run build
```

## MVP limitations

- The mock generator creates one polished single-page design.
- AI integration uses a lightweight fetch wrapper and falls back to mock output if validation fails.
- Exported React/Tailwind code is intended as a readable handoff starting point, not a full production component library.
