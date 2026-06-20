# AGENTS.md Architecture Snippet

Paste this into your project `AGENTS.md`.

---

## Architecture Guardrails

Before coding, read:

1. `PROJECT_BRIEF.md`
2. `ARCHITECTURE_RULEBOOK_FOR_CODEX.md`
3. `PROJECT_ARCHITECTURE.md`
4. Existing source files relevant to the task

Architecture rules:

- Keep the project simple, modular, and local.
- Prefer feature folders.
- One file should have one main responsibility.
- Do not create or expand god files.
- Do not mix UI, business logic, validation, and API/database calls in the same file unless the feature is tiny and the decision is documented.
- Search for existing reusable code before creating new helpers, services, components, or utilities.
- Keep one-off logic local.
- Move code to shared only when reuse is real.
- Make the smallest safe change.
- Run verification after each stage.

Technology rules:

- Treat the preferred stack as a default, not a locked rule.
- Do not add a new language, framework, runtime, database, auth provider, hosting platform, third-party service, or major dependency without explaining why and asking for approval.
- If the preferred stack does not fit, propose the better option using the Technology Decision Gate in `PROJECT_ARCHITECTURE.md`.
- Prefer reversible decisions early in the project.
- Prefer the simplest stack that solves the MVP.
- Do not overengineer because the project might grow later.

Before editing, always answer:

1. What feature/module owns this change?
2. What existing files already handle this responsibility?
3. Can this change stay local to one feature folder?
4. What is the smallest set of files that should change?
5. Is any target file already too large or mixed-responsibility?
6. Is there existing reusable code that should be used?
7. Does this require any new technology or dependency?
8. What checks will prove this works?

If a change is large, risky, architectural, or introduces new technology, plan first and wait for approval.

Do not commit or push unless explicitly asked.
