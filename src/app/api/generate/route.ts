import { ok, readJson, withRouteErrors } from "@/lib/api/response";
import { generateSchema } from "@/lib/validation/schemas";
import { requireSession } from "@/lib/auth/guard";
import { consumeRateLimit, RATE_LIMITS } from "@/lib/rate-limit";
import { errors } from "@/lib/errors";
import { createGeneration } from "@/server/services/generation.service";

export const runtime = "nodejs";
// ClipDrop can take a while, and a failover adds another attempt on top.
export const maxDuration = 120;

export const POST = withRouteErrors(async (request: Request) => {
  const session = await requireSession();

  // Limit per account rather than per IP: the resource being protected is the
  // user's credit balance and our shared ClipDrop quota.
  const limit = await consumeRateLimit(session.userId, RATE_LIMITS.generate);
  if (!limit.allowed) throw errors.rateLimited(limit.retryAfter);

  const input = generateSchema.parse(await readJson(request));

  const result = await createGeneration({
    userId: session.userId,
    prompt: input.prompt,
    presetId: input.presetId,
  });

  return ok(result);
});
