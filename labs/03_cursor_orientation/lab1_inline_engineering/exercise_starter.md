# Trainee Worksheet — Practical 3.1: Inline AI Engineering

**Trainee Name**: Anushk Mi  
**Date**: 2026-08-31  
**Workspace**: `sandbox/taskpulse_engine/`

---

## Exercise 1: Ghost Text Tab Shaping Log

Navigate to `src/core/services/task.service.ts` -> `filterTasksByPriorityAndDate`.

1. **Initial Unfiltered Suggestion**: What did Cursor suggest when pressing `Tab` once without constraints? (Did it try to import `lodash` or omit null checks?)
```typescript
// Unconstrained Tab often reaches for lodash filter/isAfter or skips invalid Date handling:
import { filter } from "lodash";
return filter(tasks, (t) => t.priority === priority);
```

2. **Accepted Refactored Implementation** (Shaped word-by-word via `Cmd+Right` / `Ctrl+Right`):
```typescript
public filterTasksByPriorityAndDate(
  tasks: TaskRecord[],
  priority?: TaskPriority,
  sinceDate?: string | Date
): TaskRecord[] {
  const parsedSince = sinceDate === undefined || sinceDate === null ? null : new Date(sinceDate);
  const targetTimestamp =
    parsedSince && !Number.isNaN(parsedSince.getTime()) ? parsedSince.getTime() : null;

  return tasks.filter((task) => {
    const matchesPriority = priority ? task.priority === priority : true;
    if (!matchesPriority) {
      return false;
    }
    if (targetTimestamp === null) {
      return true;
    }
    const createdAt = new Date(task.created_at).getTime();
    if (Number.isNaN(createdAt)) {
      return false;
    }
    return createdAt >= targetTimestamp;
  });
}
```

---

## Exercise 2: `Cmd/Ctrl+K` Inline Prompt Formulation

Navigate to `src/api/middleware/rate-limiter.ts` -> `applyRateLimiting`.

1. **Your Exact `Cmd/Ctrl+K` Prompt**:
```text
[PASTE YOUR INLINE PROMPT HERE]
Replace applyRateLimiting with an in-memory sliding window rate limiter: 100 req per 60s per client IP.
Keep signature (req: Request, res: Response, next: NextFunction).
Store timestamps in a Map and prune stale/expired keys so the Map cannot grow without bound (memory leak prevention).
On limit, return HTTP 429 JSON envelope { success: false, data: null, error: { code: "RATE_LIMIT_EXCEEDED", message: "..." } }.
Use logger.warn, never console.log. Do not change other exports.
```

2. **Inline Diff Checklist**:
- [x] Preserved function signature `(req: Request, res: Response, next: NextFunction)`
- [x] Used in-memory sliding window algorithm (timestamp array or bucket)
- [x] Returned HTTP 429 using project standard envelope `{ success: false, data: null, error: { code: "RATE_LIMIT_EXCEEDED", message: "..." } }`
- [x] Used `logger.warn` instead of `console.log`
- [x] Cleaned up stale entries to prevent memory leak

---

## Exercise 3: Diff Review Audit & Rejection Analysis

During the inline edit of `src/utils/crypto.ts` (`sanitizeUserEmail`):

1. **Did Cursor attempt to rewrite surrounding unchanged helper methods?**: [x] YES / [ ] NO
2. **What line(s) in the generated diff did you manually reject or adjust?**:
```text
Rejected a rewrite of generateSecureToken / verifySignature (out of scope).
Rejected a validator library import; kept Node-only RFC 5322-lite regex.
Kept crypto.timingSafeEqual in verifySignature unchanged.
Accepted only sanitizeUserEmail: trim, lowercase domain, reject invalid addresses.
```
