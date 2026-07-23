import { ok, withRouteErrors } from "@/lib/api/response";
import { requireSession } from "@/lib/auth/guard";
import { reconcilePendingOrders } from "@/server/services/payment.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Recovers credits for payments that completed but were never confirmed back
 * to the app (closed tab, lost connection, no webhook configured).
 *
 * Called on pricing and account page load. Cheap when there is nothing pending,
 * since the query is bounded to unsettled orders from the last 24 hours.
 */
export const POST = withRouteErrors(async () => {
  const session = await requireSession();
  const result = await reconcilePendingOrders(session.userId);
  return ok(result);
});
