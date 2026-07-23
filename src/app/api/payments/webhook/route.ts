import { NextResponse } from "next/server";
import {
  isWebhookConfigured,
  verifyWebhookSignature,
} from "@/server/payments/razorpay";
import { markOrderFailed, settleFromWebhook } from "@/server/services/payment.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Razorpay webhook receiver.
 *
 * This is the authoritative settlement path. The browser callback is a
 * convenience so the user sees credits immediately, but if the user closes the
 * tab mid-payment this endpoint still grants what they paid for.
 *
 * The raw body text is read before parsing because the HMAC is computed over
 * the exact bytes Razorpay sent - re-serialising parsed JSON would change them.
 */
export async function POST(request: Request) {
  if (!isWebhookConfigured()) {
    console.warn("[payments] webhook received but RAZORPAY_WEBHOOK_SECRET is unset");
    return NextResponse.json({ ok: false }, { status: 503 });
  }

  const raw = await request.text();
  const signature = request.headers.get("x-razorpay-signature");

  if (!signature || !verifyWebhookSignature(raw, signature)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  let event: {
    event?: string;
    payload?: {
      payment?: { entity?: { id?: string; order_id?: string; error_description?: string } };
    };
  };

  try {
    event = JSON.parse(raw);
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const entity = event.payload?.payment?.entity;
  const orderId = entity?.order_id;
  const paymentId = entity?.id;

  try {
    if (event.event === "payment.captured" && orderId && paymentId) {
      await settleFromWebhook({ orderId, paymentId });
    } else if (event.event === "payment.failed" && orderId) {
      await markOrderFailed({
        orderId,
        reason: entity?.error_description ?? "payment_failed",
      });
    }
  } catch (error) {
    // Return 500 so Razorpay retries a delivery we genuinely failed to process.
    console.error("[payments] webhook processing failed", error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
