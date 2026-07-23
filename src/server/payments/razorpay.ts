import "server-only";
import crypto from "node:crypto";
import Razorpay from "razorpay";
import { env } from "@/lib/env";

let client: Razorpay | null = null;

export function razorpayClient(): Razorpay {
  if (!client) {
    const { keyId, keySecret } = env.razorpay;
    client = new Razorpay({ key_id: keyId, key_secret: keySecret });
  }
  return client;
}

/** Constant-time compare, so signature checking cannot be probed by timing. */
function safeEqual(a: string, b: string): boolean {
  const bufferA = Buffer.from(a, "utf8");
  const bufferB = Buffer.from(b, "utf8");
  if (bufferA.length !== bufferB.length) return false;
  return crypto.timingSafeEqual(bufferA, bufferB);
}

/**
 * Verifies the Checkout handler signature.
 *
 * Razorpay signs `order_id|payment_id` with the key secret. Without this check
 * a client could simply POST a fabricated success payload and be granted
 * credits - which is exactly what v1 was exposed to, since it only re-read the
 * order status and trusted the order id the browser sent.
 */
export function verifyPaymentSignature(params: {
  orderId: string;
  paymentId: string;
  signature: string;
}): boolean {
  const expected = crypto
    .createHmac("sha256", env.razorpay.keySecret)
    .update(`${params.orderId}|${params.paymentId}`)
    .digest("hex");
  return safeEqual(expected, params.signature);
}

/** Verifies the `x-razorpay-signature` header on a webhook delivery. */
export function verifyWebhookSignature(rawBody: string, signature: string): boolean {
  const secret = env.razorpay.webhookSecret;
  if (!secret) return false;
  const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  return safeEqual(expected, signature);
}

export function isWebhookConfigured(): boolean {
  return Boolean(env.razorpay.webhookSecret);
}
