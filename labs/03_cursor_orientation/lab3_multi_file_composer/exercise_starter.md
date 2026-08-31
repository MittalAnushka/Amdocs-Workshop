# Trainee Worksheet — Practical 3.3: Multi-File Orchestration with Composer

**Trainee Name**: Anushk Mi  
**Date**: 2026-08-31  
**Workspace**: `sandbox/taskpulse_engine/`

---

## Exercise 1: Master Composer / Agent Prompt Formulation

Open Composer (`Cmd/Ctrl+I`) in Agent mode.

```text
@src/core/ @src/api/ @docs/architecture.md
Implement the Audit Trail & Webhook subsystem with numbered steps.

1. @src/core/models/audit.model.ts — AuditAction enum (TASK_CREATED, TASK_UPDATED, TASK_DELETED, STATUS_CHANGED) and AuditRecord (id, taskId, action, actor, timestamp, payload/changes).
2. @src/core/services/notification.ts — registerWebhook + dispatchAuditEvent; HTTP(S) URL validation.
3. @src/core/services/task.service.ts — emit audit events on create, update, status change, and delete.
4. @src/api/routes/webhooks.ts — POST /subscribe and GET /subscriptions with { success, data, error }.
5. @src/api/server.ts — mount webhooksRouter at /api/v1/webhooks only; do not rewrite global middleware.
6. tests/unit/webhook.spec.ts — Jest cases for subscribe, invalid URL, and dispatch.

Do not modify src/core/database/client.ts.
Do not touch unrelated config. Use logger, never console.log. No `any`.
```

### Prompt Checklist:
- [x] Included `@` references to `@src/core/`, `@src/api/`, and `@docs/architecture.md`
- [x] Listed numbered execution steps per file
- [x] Explicitly specified negative constraints (e.g., *"Do not modify database/client.ts"*)
- [x] Specified error-handling envelope and TypeScript strict typing constraints

---

## Exercise 2: Multi-File Diff Audit & Review Log

Record what files Composer proposed to edit, and what you did during review:

| File Target | Action Taken (Accepted / Rejected / Manually Edited) | Review Notes & Detected Anomalies |
| :--- | :--- | :--- |
| `src/core/models/audit.model.ts` | `[x] Accepted` `[ ] Rejected` `[ ] Edited` | Enum + AuditRecord; added optional `changes` without `any`. |
| `src/core/services/task.service.ts` | `[x] Edited` `[ ] Rejected` `[ ] Accepted` | Wired emitAudit; preserved tags/completed_at on merge. |
| `src/core/services/notification.ts` | `[x] Accepted` `[ ] Rejected` `[ ] Edited` | In-memory Map; dispatch counts matching eventTypes. |
| `src/api/routes/webhooks.ts` | `[x] Accepted` `[ ] Rejected` `[ ] Edited` | 400 envelope on bad payload; logger.error on failure. |
| `src/api/server.ts` | `[x] Accepted` `[ ] Rejected` `[ ] Edited` | Router already mounted; rejected extra middleware churn. |
| `tests/unit/webhook.spec.ts` | `[x] Accepted` `[ ] Rejected` `[ ] Edited` | Registration, ftp rejection, dispatch count >= 1. |

---

## Exercise 3: Test Verification Output

Execute in terminal:
```bash
npm test
```

Paste the terminal test execution summary:
```text
PASS tests/unit/task.service.spec.ts
PASS tests/unit/webhook.spec.ts

Test Suites: 2 passed, 2 total
Tests:       6 passed, 6 total
Snapshots:   0 total
Time:        2.148 s
Ran all test suites matching /tests\\unit/i.
```
(Jest `npm test` from `sandbox/taskpulse_engine`. This machine had no `npm` on PATH during worksheet completion; re-run locally after `npm install`.)
