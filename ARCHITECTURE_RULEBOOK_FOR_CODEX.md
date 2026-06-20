# Architecture Rulebook for Codex

Use this file before coding starts and keep it in every project repo.

This file tells Codex how to keep the project simple, modular, and safe to change over many prompts. It is intentionally project-agnostic. Put project-specific stack choices, folders, commands, and decisions in `PROJECT_ARCHITECTURE.md`.

---

## 1. Core Goal

Build the smallest working system that has clear boundaries.

The goal is not to create lots of files. The goal is that every piece of code has an obvious home, and most changes remain local to one feature or module.

Good architecture is:

- simple
- boring
- modular
- easy to inspect
- easy to test
- easy to change locally
- resistant to god files and repeated code
- flexible enough to choose the right technology for the job

Bad architecture is:

- one large file that does everything
- UI mixed with API calls and business logic
- duplicated helpers across features
- everything dumped into `utils`
- shared abstractions created before reuse is real
- changes that touch many unrelated files without a clear reason
- choosing a language/framework/dependency without explaining why
- locking the project into a stack before the project needs are understood

---

## 2. Required Reading Order for Codex

Before making architecture or implementation decisions, read:

1. `PROJECT_BRIEF.md` — what we are building and why.
2. `ARCHITECTURE_RULEBOOK_FOR_CODEX.md` — universal architecture rules.
3. `PROJECT_ARCHITECTURE.md` — project-specific stack, structure, and decisions.
4. `AGENTS.md` — current project instructions.
5. Existing source files relevant to the requested change.

Do not start writing code until the correct feature area, technology choice, and smallest safe change are clear.

---

## 3. Technology Choice Rules

### 3.1 Preferred Stack Is a Default, Not a Prison

The user's preferred stack is a starting point, not an automatic requirement.

Use the preferred stack when it fits the project. If another language, framework, service, or dependency is a better fit, Codex may propose it, but must explain why and wait for approval before using it.

### 3.2 Approval Required Before New Technology

Codex must ask for approval before:

- adding a new programming language
- adding a new framework
- adding a new runtime
- adding a new database or storage technology
- adding a new auth provider
- adding a new hosting/deployment platform
- adding a new third-party service
- adding a major dependency
- changing the chosen stack for an existing project
- introducing architecture that would be difficult to undo later

Minor dev-only packages may still require explanation if they affect project complexity, build speed, security, or maintainability.

### 3.3 Required Tech Proposal Format

When proposing a stack choice or alternative, Codex must answer:

1. What problem does this technology solve?
2. Why does the default/preferred stack fit or not fit?
3. What is the simplest option?
4. What are the benefits?
5. What complexity, cost, or risk does it add?
6. What is the learning curve for the user?
7. How does it affect deployment and maintenance?
8. Can it be replaced later if needed?
9. What verification will prove it works?
10. Recommendation: use default, use alternative, or delay the decision.

Then stop and wait for approval.

### 3.4 Do Not Add Dependencies Casually

Before adding a dependency, Codex must check whether the same goal can be achieved with:

1. existing project code
2. the standard library/platform API
3. an already-installed dependency
4. a small local helper
5. a new dependency only if it clearly reduces complexity

### 3.5 Prefer Reversible Decisions Early

Early in a project, prefer decisions that are easy to change.

Avoid:

- complex infrastructure before the MVP proves it needs it
- microservices before there is a clear boundary
- multiple languages before there is a reason
- heavy state management before the app has complex state
- generic frameworks before the workflow is understood
- premature abstraction because the app might grow later

---

## 4. Architecture Principles

### 4.1 One Responsibility Per File

A file should have one main reason to change.

Avoid files that combine:

- UI rendering
- form validation
- API calls
- database calls
- business rules
- formatting
- navigation
- analytics
- error handling
- configuration

A small file can contain several small helper functions if they all support the same responsibility.

Do not split every function into its own file by default. Split by responsibility, not by line count alone.

---

### 4.2 Feature-First Organisation

Prefer feature folders for app code.

Example:

```text
src/
  features/
    auth/
    dashboard/
    uploads/
    gallery/
    settings/
  shared/
    components/
    utils/
    api/
    types/
  app/ or routes/
```

A feature folder should contain code that mostly changes together.

A change to `gallery` should usually stay inside `src/features/gallery`.
A change to `settings` should usually stay inside `src/features/settings`.

Use `shared` only for code that is genuinely reused by more than one feature.

---

### 4.3 Layering Rules

Use clear layers.

```text
UI layer
  Displays data and collects user input.

Feature/action layer
  Coordinates what happens when the user does something.

Service/API layer
  Talks to external systems such as Supabase, REST APIs, storage, agent bridges, or local device APIs.

Validation layer
  Validates inputs and business constraints.

Types/schema layer
  Defines the shape of data.

Shared layer
  Holds reusable components, helpers, constants, and utilities.
```

Dependency direction:

```text
UI -> feature/actions -> services -> external systems
```

Rules:

- UI can call feature actions.
- Feature actions can call services.
- Services can call external systems.
- Shared utilities should not know about specific screens or pages.
- Avoid circular dependencies.
- Avoid business logic inside UI files.
- Avoid API/database calls directly inside UI files unless the project is extremely small and the decision is documented.

---

## 5. File Size Budget

Use these as warning signs, not strict rules:

```text
0-150 lines: usually fine.
150-250 lines: okay if cohesive.
250-400 lines: review for splitting.
400+ lines: likely too large unless there is a strong reason.
```

If a file is already large, do not add a new responsibility to it.

Before adding to a large file, consider a small behavior-preserving extraction.

---

## 6. Reuse Rules

### 6.1 Start Local, Then Promote

Do not make everything generic immediately.

Use this rule:

```text
Used once: keep it local.
Used twice: consider whether it is truly the same idea.
Used three times: move it to shared if the behavior is stable.
```

This avoids both copy-paste mess and over-engineered abstractions.

---

### 6.2 Search Before Creating

Before creating a new:

- helper
- utility
- service
- component
- hook
- validation function
- type
- API wrapper

Codex must search for existing similar code.

If similar code exists:

1. Reuse it if it fits.
2. Extend it only if that keeps it clear.
3. Create new code only if the behavior is genuinely different.
4. Explain why existing code was not reused.

---

### 6.3 Avoid the Junk Drawer Problem

Do not dump random code into:

```text
utils/
helpers/
common/
shared/
```

Shared code should have a clear category.

Better:

```text
shared/date/formatDate.ts
shared/validation/fileValidation.ts
shared/api/createApiClient.ts
shared/components/Button.tsx
```

Worse:

```text
shared/utils/misc.ts
shared/helpers/randomStuff.ts
```

---

## 7. Required Architecture Check Before Editing

Before code changes, Codex must answer:

1. What feature or module owns this change?
2. What existing files already handle this responsibility?
3. Can this change stay local to one feature folder?
4. What is the smallest set of files that should change?
5. Is any target file already too large or mixed-responsibility?
6. Is there existing reusable code that should be used?
7. Would a small extraction make the change safer?
8. Does this require any new technology, dependency, runtime, or service?
9. What verification will prove this works?

If the task is large, risky, structural, touches many files, or changes technology choices, Codex must plan first and wait for approval.

---

## 8. Implementation Rules

When implementing:

- Make the smallest safe change.
- Do not add future-stage features.
- Do not rewrite unrelated files.
- Do not introduce new dependencies unless the reason is explained and approved.
- Keep feature code inside the relevant feature folder.
- Keep project-wide reusable code inside `shared` only when reuse is real.
- Preserve existing behavior unless the task asks to change it.
- Update docs when architecture decisions change.
- Run relevant verification after the change.

---

## 9. Refactor Rules

Refactoring is allowed when it makes the requested change safer, but it must be controlled.

Behavior-preserving refactor rules:

1. Do not add new features during a refactor.
2. Do not change user-visible behavior unless requested.
3. Move code by responsibility.
4. Keep public interfaces stable where possible.
5. Run checks after each meaningful step.
6. Summarize exactly what moved and why.

If a god file exists, do not keep adding to it. Propose a small split plan first.

---

## 10. Feature Folder Patterns

Only create the files that are needed. These are patterns, not mandatory files.

### Web / Next.js / React Feature

```text
src/features/<feature>/
  <Feature>Page.tsx or <Feature>Screen.tsx
  <Feature>View.tsx
  <feature>Actions.ts
  <feature>Service.ts
  <feature>Types.ts
  <feature>Validation.ts
  <feature>.test.ts
```

### Mobile / React Native or Expo Feature

```text
src/features/<feature>/
  <Feature>Screen.tsx
  <feature>Actions.ts
  <feature>Service.ts
  <feature>Types.ts
  <feature>Validation.ts
  <feature>.test.ts
```

### Native Android / Kotlin Feature

```text
app/src/main/java/<package>/features/<feature>/
  <Feature>Screen.kt or <Feature>Activity.kt
  <Feature>ViewModel.kt
  <Feature>Service.kt
  <Feature>Repository.kt
  <Feature>Models.kt
  <Feature>Validator.kt
```

### Python / FastAPI Feature

```text
app/features/<feature>/
  routes.py
  service.py
  schemas.py
  repository.py
  tests/
```

### Supabase Feature Area

```text
supabase/
  migrations/
  functions/
src/features/<feature>/
  <feature>Service.ts
  <feature>Types.ts
  <feature>Validation.ts
```

---

## 11. Verification Rules

Every stage must end with verification.

Preferred checks:

- lint
- typecheck
- unit tests
- integration tests
- build
- migration dry run
- manual smoke test instructions
- screenshot/UI check for visual work

If no verification exists yet, the next task should create the smallest useful verification loop before more feature work continues.

Do not claim a task is complete if checks were not run. If checks could not be run, explain why.

---

## 12. Review Rules

Before committing or moving to the next stage, review the diff for:

1. God files.
2. Mixed responsibilities.
3. Duplicated logic.
4. Code placed in the wrong feature.
5. Code placed in shared too early.
6. Code copied instead of reused.
7. Files that became too large.
8. Missing verification.
9. Unnecessary dependencies.
10. Changes outside the intended scope.
11. Unapproved technology choices.
12. Stack decisions that should be documented.

Fix only the issues necessary for the current stage.

---

## 13. Definition of Done

A task is done only when:

- The requested behavior is implemented.
- The change is placed in the correct feature/module.
- No unnecessary duplicated code was added.
- No god file was made worse.
- No unapproved technology or dependency was introduced.
- Relevant docs were updated if needed.
- Relevant checks were run, or failures were explained.
- Changed files were summarized.
- Remaining risks and next steps were listed.

---

## 14. Prompt Codex Should Follow Before Each Task

When asked to implement a feature, Codex should internally follow this pattern:

```text
1. Read project instructions.
2. Locate the owning feature/module.
3. Search for existing reusable code.
4. Check whether the current stack still fits the task.
5. Propose the smallest safe plan.
6. Ask for approval if technology, architecture, or dependency choices change.
7. Implement only the approved scope.
8. Run verification.
9. Review architecture impact.
10. Summarize results.
```
