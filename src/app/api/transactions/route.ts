import { ok, withRouteErrors } from "@/lib/api/response";
import { requireSession } from "@/lib/auth/guard";
import { listTransactions } from "@/server/services/payment.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = withRouteErrors(async () => {
  const session = await requireSession();
  const transactions = await listTransactions(session.userId);
  return ok({ transactions });
});
