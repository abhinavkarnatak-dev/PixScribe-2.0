import "server-only";
import { connectToDatabase } from "@/lib/db/connect";
import { RateLimitModel } from "@/lib/db/models/rate-limit.model";

export interface RateLimitRule {
  /** Namespace, so different endpoints do not share a counter. */
  scope: string;
  limit: number;
  windowSeconds: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  /** Seconds until the current window rolls over. */
  retryAfter: number;
}

/**
 * Fixed-window counter backed by a single atomic upsert.
 *
 * `$inc` inside `findOneAndUpdate` is applied server-side by Mongo, so two
 * concurrent requests can never read the same count and both pass.
 */
export async function consumeRateLimit(
  identifier: string,
  rule: RateLimitRule,
): Promise<RateLimitResult> {
  await connectToDatabase();

  const windowMs = rule.windowSeconds * 1000;
  const now = Date.now();
  const windowStart = Math.floor(now / windowMs) * windowMs;
  const expiresAt = new Date(windowStart + windowMs);
  const key = `${rule.scope}:${identifier}:${windowStart}`;

  const doc = await RateLimitModel.findOneAndUpdate(
    { key },
    { $inc: { count: 1 }, $setOnInsert: { expiresAt } },
    { upsert: true, returnDocument: "after", setDefaultsOnInsert: true },
  ).lean();

  const count = doc?.count ?? 1;
  const retryAfter = Math.max(1, Math.ceil((windowStart + windowMs - now) / 1000));

  return {
    allowed: count <= rule.limit,
    remaining: Math.max(0, rule.limit - count),
    retryAfter,
  };
}

export const RATE_LIMITS = {
  /** Generation is the expensive path: credits plus third-party quota. */
  generate: { scope: "generate", limit: 8, windowSeconds: 60 },
  /** Slows credential stuffing without punishing a user who mistypes once. */
  login: { scope: "login", limit: 8, windowSeconds: 300 },
  signup: { scope: "signup", limit: 5, windowSeconds: 900 },
  /** Stops order spam from filling the transactions collection. */
  createOrder: { scope: "order", limit: 10, windowSeconds: 300 },
} as const satisfies Record<string, RateLimitRule>;

/** Best-effort client IP for limiting unauthenticated routes. */
export function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim();
  return request.headers.get("x-real-ip")?.trim() || "unknown";
}
