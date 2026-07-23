import { ok, readJson, withRouteErrors } from "@/lib/api/response";
import { createOrderSchema } from "@/lib/validation/schemas";
import { requireSession } from "@/lib/auth/guard";
import { consumeRateLimit, RATE_LIMITS } from "@/lib/rate-limit";
import { errors } from "@/lib/errors";
import { createOrder } from "@/server/services/payment.service";

export const runtime = "nodejs";

export const POST = withRouteErrors(async (request: Request) => {
  const session = await requireSession();

  const limit = await consumeRateLimit(session.userId, RATE_LIMITS.createOrder);
  if (!limit.allowed) throw errors.rateLimited(limit.retryAfter);

  const input = createOrderSchema.parse(await readJson(request));
  const order = await createOrder({ userId: session.userId, planId: input.planId });

  return ok({ order });
});
