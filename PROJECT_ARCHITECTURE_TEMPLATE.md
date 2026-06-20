# Project Architecture

Use this file for the specific project you are building.

`ARCHITECTURE_RULEBOOK_FOR_CODEX.md` contains the reusable rules. This file contains the project-specific choices: stack, folders, features, commands, and architectural decisions.

Important: the preferred stack below is a default starting point, not a locked decision. Codex may propose another technology only if it explains the reason, tradeoffs, and asks for approval before using it.

---

## 1. Project Summary

Project name:

Short description:

Main user problem:

MVP goal:

Out of scope for MVP:

---

## 2. Project Type

Choose one or more:

- Web app
- Mobile app
- Backend/API
- AI/agent tool
- Browser extension
- Desktop app
- University/coursework project
- Other:

---

## 3. Preferred Default Stack

These are preferred defaults, not automatic requirements. Use them when they fit the project.

### Web

- Next.js
- TypeScript
- Tailwind CSS
- Vercel

### Mobile

- React Native / Expo
- TypeScript

### Data/Auth/Storage

- Supabase
- Postgres
- SQL
- Supabase Auth where useful
- Supabase Storage where useful

### Backend / AI Services

- Python
- FastAPI
- Supabase Edge Functions where lightweight serverless functions are enough

### Content / Docs

- Markdown / MDX

### Stack Flexibility Rule

Codex must treat the preferred stack as a starting hypothesis.

Codex may recommend a different language, framework, service, or dependency when the project needs justify it. However, Codex must not install, scaffold, or commit to the alternative until it has explained the decision and received approval.

Examples:

- Use Next.js for most web apps, but consider Astro for a mostly static content site.
- Use React Native / Expo for many mobile apps, but consider native Kotlin if the project needs deep Android system features, background services, accessibility services, or keyboard/IME behavior.
- Use Supabase for database/auth/storage when it keeps the project simple, but consider SQLite for local-only/offline-first apps.
- Use Python/FastAPI for AI/backend services when Python libraries or separate services are useful, but use Next.js API routes or server actions if the backend is tiny and keeping everything in one app is simpler.

---

## 4. Technology Decision Gate

Before choosing or changing technology, Codex must fill this out and wait for approval.

### Technology Proposal: `<name>`

Problem being solved:

Default/preferred option:

Proposed option:

Why the default may not fit:

Why the proposed option may fit better:

Benefits:

Costs/risks:

Learning curve for the user:

Deployment/hosting impact:

Maintenance impact:

Can we delay this decision?

Can we replace this later?

Verification needed:

Recommendation:

Approval status:

- [ ] Approved
- [ ] Rejected
- [ ] Deferred

---

## 5. Chosen Stack for This Project

Only fill this after the project needs have been inspected.

Frontend:

Mobile:

Backend:

Database:

Auth:

Storage:

Hosting/deployment:

Testing:

Other services:

### Why this stack was chosen

Explain the simple reason for each major choice.

- Frontend:
- Mobile:
- Backend:
- Database:
- Auth:
- Storage:
- Hosting:

---

## 6. Folder Structure

Planned structure:

```text
src/
  features/
  shared/
  app/ or routes/
docs/
```

Project-specific structure:

```text
# Replace this with the real structure once chosen.
```

Rules:

- Feature-specific code goes in `src/features/<feature>` or the equivalent feature/module folder for this stack.
- Reusable code goes in `src/shared` only when reuse is real.
- App routing/screen entry points should stay thin.
- External service calls belong in service/API/repository files, not UI files.
- If the selected stack uses a different convention, document the equivalent folders here.

---

## 7. Feature Boundaries

List the main features and what each owns.

### Feature: `<feature-name>`

Owns:

-

Does not own:

-

Likely files:

```text
src/features/<feature-name>/
```

---

## 8. Data Flow

Describe how data should move through the app.

Example:

```text
User action
  -> UI screen/component
  -> feature action/use case
  -> service/API/repository
  -> database/external system
  -> result returned to feature action
  -> UI updates state
```

Project-specific data flow:

```text
# Fill in for this project.
```

---

## 9. Shared Code Rules for This Project

Shared code allowed in this project:

```text
src/shared/components/
src/shared/utils/
src/shared/api/
src/shared/types/
src/shared/validation/
```

Before adding shared code, Codex must confirm:

1. Where is this used now?
2. Is it likely to be reused?
3. Would keeping it local be simpler?
4. Is the shared name clear and specific?

---

## 10. Verification Commands

Codex must keep this section updated.

Install:

```bash
# command here
```

Run dev server:

```bash
# command here
```

Lint:

```bash
# command here
```

Typecheck:

```bash
# command here
```

Tests:

```bash
# command here
```

Build:

```bash
# command here
```

Manual smoke test:

```text
1.
2.
3.
```

---

## 11. Architecture Decisions

Record important decisions here. Keep them short.

### Decision 001: `<title>`

Date:

Decision:

Reason:

Tradeoff:

Approval status:

---

## 12. Current Build Stage

Current stage:

Goal:

Allowed scope:

Out of scope:

Verification required:

---

## 13. Codex Task Rule

Before each task, Codex must answer:

1. Which feature/module owns this change?
2. Which files should change?
3. What existing code can be reused?
4. Does this require a new dependency, language, framework, service, or runtime?
5. What is the smallest safe implementation?
6. What checks will be run?

If the task would change architecture or technology choices, Codex must update this file and wait for approval before implementing.
