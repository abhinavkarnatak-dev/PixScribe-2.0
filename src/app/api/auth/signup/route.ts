import { ok, readJson, withRouteErrors } from "@/lib/api/response";
import { signupSchema } from "@/lib/validation/schemas";
import { registerUser } from "@/server/services/auth.service";
import { createSessionCookie } from "@/lib/auth/session";
import { clientIp, consumeRateLimit, RATE_LIMITS } from "@/lib/rate-limit";
import { errors } from "@/lib/errors";

export const runtime = "nodejs";

export const POST = withRouteErrors(async (request: Request) => {
  const limit = await consumeRateLimit(clientIp(request), RATE_LIMITS.signup);
  if (!limit.allowed) throw errors.rateLimited(limit.retryAfter);

  const input = signupSchema.parse(await readJson(request));
  const { session, user } = await registerUser(input);
  await createSessionCookie(session);

  return ok({ user }, { status: 201 });
});
