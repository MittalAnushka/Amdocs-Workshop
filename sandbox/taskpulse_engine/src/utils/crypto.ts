import crypto from "crypto";

const SECRET_KEY = process.env.APP_SECRET || "taskpulse-enterprise-default-secret-key-32b";

/**
 * Generates cryptographically secure random hexadecimal token
 */
export function generateSecureToken(bytes: number = 32): string {
  return crypto.randomBytes(bytes).toString("hex");
}

/**
 * Creates HMAC SHA-256 signature for payload verification
 */
export function createHmacSignature(data: string): string {
  return crypto.createHmac("sha256", SECRET_KEY).update(data).digest("hex");
}

/**
 * Constant-time comparison to prevent timing attacks
 */
export function verifySignature(providedSig: string, expectedSig: string): boolean {
  if (!providedSig || !expectedSig || providedSig.length !== expectedSig.length) {
    return false;
  }
  const bufA = Buffer.from(providedSig, "utf8");
  const bufB = Buffer.from(expectedSig, "utf8");
  return crypto.timingSafeEqual(bufA, bufB);
}

/**
 * Naive email sanitization function (Target for Lab 3.1 Task 3 Inline Edit)
 */
export function sanitizeUserEmail(rawEmail: string): string {
  if (!rawEmail) {
    return "";
  }

  const trimmed = rawEmail.trim();
  const atIndex = trimmed.lastIndexOf("@");
  if (atIndex <= 0 || atIndex === trimmed.length - 1) {
    return "";
  }

  const localPart = trimmed.slice(0, atIndex);
  const domainPart = trimmed.slice(atIndex + 1).toLowerCase();
  const candidate = `${localPart}@${domainPart}`;

  // Practical RFC 5322-inspired check: reject whitespace, multiple @, and missing TLD.
  const rfc5322Lite = /^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)+$/;
  return rfc5322Lite.test(candidate) ? candidate : "";
}
