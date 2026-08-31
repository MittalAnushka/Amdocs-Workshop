import { Request, Response, NextFunction } from "express";
import { logger } from "../../utils/logger";

/**
 * ============================================================================
 * LAB 3.1 EXERCISE 2: INLINE EDIT REFACTORING (Cmd/Ctrl+K)
 * ============================================================================
 * Trainee Task: Highlight the applyRateLimiting function below and use Cmd/Ctrl+K
 * to generate an in-memory sliding-window rate limiter (100 req / 60s per client IP)
 * that cleans up stale entries and returns the standard project error envelope on HTTP 429.
 */
const WINDOW_MS = 60_000;
const MAX_REQUESTS = 100;
const requestLog = new Map<string, number[]>();

function pruneExpired(timestamps: number[], now: number): number[] {
  return timestamps.filter((ts) => now - ts < WINDOW_MS);
}

function pruneStaleMapEntries(now: number): void {
  for (const [clientKey, timestamps] of requestLog.entries()) {
    const kept = pruneExpired(timestamps, now);
    if (kept.length === 0) {
      requestLog.delete(clientKey);
    } else {
      requestLog.set(clientKey, kept);
    }
  }
}

export function applyRateLimiting(req: Request, res: Response, next: NextFunction): void {
  const clientKey = req.ip || req.socket.remoteAddress || "unknown";
  const now = Date.now();
  const windowHits = pruneExpired(requestLog.get(clientKey) || [], now);

  if (windowHits.length >= MAX_REQUESTS) {
    requestLog.set(clientKey, windowHits);
    logger.warn(`[RateLimiter] Sliding-window limit exceeded for ${clientKey}`);
    res.status(429).json({
      success: false,
      data: null,
      error: {
        code: "RATE_LIMIT_EXCEEDED",
        message: "Too many requests. Limit is 100 requests per 60 seconds.",
      },
    });
    return;
  }

  windowHits.push(now);
  requestLog.set(clientKey, windowHits);

  if (requestLog.size > 5_000) {
    pruneStaleMapEntries(now);
  }

  next();
}
