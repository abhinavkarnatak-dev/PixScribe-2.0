import { z } from "zod";
import { ok, readJson, withRouteErrors } from "@/lib/api/response";
import { requireSession } from "@/lib/auth/guard";
import { markOrderCancelled, markOrderFailed } from "@/server/services/payment.service";

export const runtime = "nodejs";

const schema = z.object({
  orderId: z.string().min(1),
  outcome: z.enum(["cancelled", "failed"]),
  reason: z.string().max(300).optional(),
});

/**
 * Records that a checkout ended without payment.
 *
 * This only ever moves a transaction to a non-granting state, so a hostile
 * caller can at worst mark their own unpaid order as failed. Credits are never
 * touched here.
 */
export const POST = withRouteErrors(async (request: Request) => {
  const session = await requireSession();
  const input = schema.parse(await readJson(request));

  if (input.outcome === "cancelled") {
    await markOrderCancelled({ orderId: input.orderId, userId: session.userId });
  } else {
    await markOrderFailed({
      orderId: input.orderId,
      userId: session.userId,
      reason: input.reason ?? "payment_failed",
    });
  }

  return ok({});
});
