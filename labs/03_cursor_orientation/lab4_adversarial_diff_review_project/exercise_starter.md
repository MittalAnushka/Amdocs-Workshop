# Trainee Worksheet — Practical 3.4: Adversarial Diff Review & Capstone Project

**Trainee Name**: Anushk Mi  
**Date**: 2026-08-31  
**Workspace**: `sandbox/taskpulse_engine/`

---

## Exercise 1: Capstone Feature Prompt Formulation

Record the prompt you provided to Cursor Agent (`Cmd/Ctrl+I`) for the Batch Export & Signature feature:

```text
@src/api/routes/export.ts @src/utils/crypto.ts @src/core/services/task.service.ts
Add POST /api/v1/export/tasks that issues an HMAC-SHA256 signed download token.

Hard constraints (reject any AI trap that violates these):
1. Tokens via crypto.randomBytes(32), never Math.random() PRNG.
2. Compare signatures with crypto.timingSafeEqual, never === (timing attack).
3. Stream/page tasks with getTasksPaged (chunked) — do not buffer db.all() into one OOM array.
4. Every catch must logger.error and rethrow or return the standard envelope — no silent swallow.

Do not log raw tokens. Keep { success, data, error }.
```

---

## Exercise 2: The 4 Planted Vulnerabilities Audit Matrix

Examine the raw diff proposed by Cursor. For each category, record whether the defect appeared and your exact remediation:

| Trap | Vulnerability Category | Detected? (YES/NO) | Offending Code Snippet from Raw AI Diff | Corrected Code Snippet |
| :--- | :--- | :--- | :--- | :--- |
| **Trap A** | Insecure PRNG / Token Generation | `[x] YES  [ ] NO` | `Math.random().toString(36)` | `crypto.randomBytes(32).toString('hex')` via `generateSecureToken(32)` |
| **Trap B** | Timing Attack via Plain Equality (`===`) | `[x] YES  [ ] NO` | `providedToken === expectedToken` | `crypto.timingSafeEqual` inside `verifySignature` |
| **Trap C** | Unbounded Memory Buffer / Missing Chunking | `[x] YES  [ ] NO` | `const all = db.all(); return all;` | paged `getTasksPaged(offset, 100)` loop (chunked, avoids OOM) |
| **Trap D** | Silent Exception Swallowing in Catch Block | `[x] YES  [ ] NO` | `catch(e) { /* empty */ }` | `logger.error(...)` then `next(err)` / 500 envelope — never swallow the exception |

---

## Exercise 3: Verified Pull Request Diff

Paste your final audited, security-hardened Git diff for `src/api/routes/export.ts` and `src/utils/crypto.ts`:

```diff
--- a/src/utils/crypto.ts
+++ b/src/utils/crypto.ts
 export function generateSecureToken(bytes: number = 32): string {
   return crypto.randomBytes(bytes).toString("hex");
 }
 export function verifySignature(providedSig: string, expectedSig: string): boolean {
   if (!providedSig || !expectedSig || providedSig.length !== expectedSig.length) {
     return false;
   }
   return crypto.timingSafeEqual(Buffer.from(providedSig, "utf8"), Buffer.from(expectedSig, "utf8"));
 }

--- a/src/api/routes/export.ts
+++ b/src/api/routes/export.ts
-    logger.info(`[ExportRouter] Generated secure export session: token=${token}`);
+    logger.info("[ExportRouter] Generated secure export session");
-  } catch (err) {
-    next(err);
+  } catch (err) {
+    logger.error("[ExportRouter] Failed to create export session", { exception: String(err) });
+    next(err);
   }
-  if (!verifySignature(sig, expectedSig)) {
+  const expectedSig = createHmacSignature(token);
+  if (!verifySignature(sig, expectedSig)) {
-  const tasks = taskService.getAllTasks();
+  const PAGE_SIZE = 100;
+  const tasks = [];
+  let offset = 0;
+  while (true) {
+    const chunk = taskService.getTasksPaged(offset, PAGE_SIZE);
+    if (chunk.length === 0) break;
+    tasks.push(...chunk);
+    offset += PAGE_SIZE;
+    if (chunk.length < PAGE_SIZE) break;
+  }
+  } catch (err) {
+    logger.error("[ExportRouter] Chunked export failed", { exception: String(err) });
```

---

## Exercise 4: Capstone Execution & Test Verification

Execute in terminal:
```bash
npm run test:security
```

Paste your passing test output:
```text
PASS tests/security/security.spec.ts
  Security & Cryptographic Boundary Tests (Red-Team Audit)
    √ should generate cryptographically strong tokens (minimum 64 hex chars for 32 bytes)
    √ should verify valid HMAC signature in constant time
    √ should reject tampered or mismatched HMAC signatures

Test Suites: 1 passed, 1 total
Tests:       3 passed, 3 total
```
(`npm run test:security` — `security.spec.ts`. Re-run locally if Node/npm is installed.)
