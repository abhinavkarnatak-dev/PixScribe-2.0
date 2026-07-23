import { ok, readJson, withRouteErrors } from "@/lib/api/response";
import { verifyPaymentSchema } from "@/lib/validation/schemas";
import { requireSession } from "@/lib/auth/guard";
import { verifyAndSettlePayment } from "@/server/services/payment.service";

export const runtime = "nodejs";

export const POST = withRouteErrors(async (request: Request) => {
  const session = await requireSession();
  const input = verifyPaymentSchema.parse(await readJson(request));

  const result = await verifyAndSettlePayment({
    userId: session.userId,
    orderId: input.razorpay_order_id,
    paymentId: input.razorpay_payment_id,
    signature: input.razorpay_signature,
  });

  return ok({
    credits: result.credits,
    creditsAdded: result.creditsAdded,
    planName: result.planName,
    newlyGranted: result.newlyGranted,
  });
});
