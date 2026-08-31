# Trainee Worksheet — Practical 3.2: Context Engineering & Grounded Chat Q&A

**Trainee Name**: Anushk Mi  
**Date**: 2026-08-31  
**Workspace**: `sandbox/taskpulse_engine/`

---

## Exercise 1: Ungrounded vs Grounded Chat Diagnostic

### 1.1 Ungrounded Query Test
- **Prompt Sent**: `Why is completed_at timestamp resetting in tasks?`
- **Result Summary**: (Did it make generic guesses or refer to external frameworks like Prisma/Postgres that aren't in this project?)
```text
Ungrounded chat guessed ORM/Prisma/Postgres timezone columns and generic PATCH merge advice.
It did not cite task.service.ts or the in-memory Map store used by this repo.
```

### 1.2 Scoped Grounded Query Test
- **Prompt Sent**:
```text
@task.service.ts @src/core/models/task.model.ts @src/api/routes/tasks.ts
Analyze the concurrency model in updateTaskStatus and updateTask.
Trace how partial PATCH updates mutate the in-memory record.
Identify why completed_at and tags are dropped during concurrent status updates (shallow object spread overwrite).
```
- **Identified Root Cause in `src/core/services/task.service.ts`**:
```text
updateTask used a shallow spread: { ...existing, ...payload, updated_at }.
A concurrent PATCH that omits tags / completed_at can still overwrite those fields when payload
contains undefined keys or when a second writer replaces the whole record after a status-only write.
Destructuring without copying existing.tags (array reference) also lets callers mutate shared state.
Fix: merge field-by-field, preserve created_at/tags, and set completed_at when status becomes COMPLETED
instead of dropping it via a destructive spread.
```

---

## Exercise 2: Project Rules Definition (`.cursor/rules/`)

### 2.1 File: `.cursor/rules/01-error-handling.mdc`
```markdown
---
description: Global Error Handling and Structured Logging Standards
globs: ["src/**/*.ts"]
alwaysApply: true
---

# Rules:
1. Never use `console.log`, `console.error`, or `console.warn`. Always import `{ logger }` from `../../utils/logger`.
2. All HTTP responses must use `{ success: boolean, data: T | null, error: { code: string, message: string } | null }`.
3. Wrap route handlers in try/catch, pass failures to `next(err)`, and set explicit status codes (200, 201, 400, 404, 429, 500).
```

### 2.2 File: `.cursor/rules/02-security-boundary.mdc`
```markdown
---
description: Cryptographic & Data Security Boundary Constraints
globs: ["src/**/*.ts"]
alwaysApply: true
---

# Rules:
1. Never use `Math.random()` for tokens. Use `crypto.randomBytes(32).toString("hex")`.
2. Never compare HMAC/auth tokens with `===`. Use `crypto.timingSafeEqual` after equal-length Buffer checks.
3. Never concatenate raw user input into storage queries; sanitize ids/emails; never log secrets.
```

---

## Exercise 3: Adversarial Rule Enforcement Check

1. **Test Prompt Used in `src/api/routes/tasks.ts`**:
```text
Write a route DELETE /tasks/:id that logs errors to console if missing.
```

2. **Did Cursor follow your `.cursorrules` instead of the user prompt's request to log to console?**:
- [x] Yes, it imported and used `logger.error`
- [x] Yes, it returned `{ success: false, data: null, error: { ... } }`
- [ ] No, it used `console.log` / `console.error`
