import "server-only";
import { Types } from "mongoose";
import { connectToDatabase } from "@/lib/db/connect";
import {
  TransactionModel,
  type TransactionStatus,
} from "@/lib/db/models/transaction.model";
import { getPlan, type Plan } from "@/config/plans";
import { AppError, errors } from "@/lib/errors";
import { grantCredits } from "@/server/services/credit.service";
import { razorpayClient, verifyPaymentSignature } from "@/server/payments/razorpay";

export interface OrderView {
  orderId: string;
  amount: number;
  currency: string;
  planName: string;
  credits: number;
}

export interface TransactionView {
  id: string;
  planName: string;
  /** Rupees, for display. The stored value is paise. */
  amount: number;
  credits: number;
  status: TransactionStatus;
  creditsGranted: boolean;
  paymentId: string | null;
  createdAt: string;
}

export async function createOrder(params: {
  userId: string;
  planId: string;
}): Promise<OrderView> {
  const plan: Plan | undefined = getPlan(params.planId);
  if (!plan) throw errors.notFound("That plan");

  await connectToDatabase();

  // Amount is derived from the server-side plan table, never from the request
  // body, so a tampered client cannot buy 250 credits for one rupee.
  const amountInPaise = plan.price * 100;

  let order;
  try {
    order = await razorpayClient().orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: `px_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
      notes: { userId: params.userId, planId: plan.id },
    });
  } catch (error) {
    console.error("[payments] order creation failed", error);
    throw new AppError(
      "PAYMENT_FAILED",
      "We could not start the checkout. Please try again.",
      502,
    );
  }

  await TransactionModel.create({
    userId: new Types.ObjectId(params.userId),
    planId: plan.id,
    planName: plan.name,
    amount: amountInPaise,
    currency: "INR",
    credits: plan.credits,
    status: "created",
    razorpayOrderId: order.id,
  });

  return {
    orderId: order.id,
    amount: amountInPaise,
    currency: "INR",
    planName: plan.name,
    credits: plan.credits,
  };
}

export interface SettlementResult {
  credits: number | null;
  creditsAdded: number;
  planName: string;
  /** True when this call is what actually granted the credits. */
  newlyGranted: boolean;
}

/**
 * Settles a paid order and grants credits exactly once.
 *
 * Both the Checkout callback and the webhook route here. The
 * `creditsGranted: false` filter on the update is the idempotency guard: only
 * one caller can flip the flag, so credits cannot be double-granted no matter
 * how many times or how concurrently this runs.
 */
async function settleOrder(params: {
  orderId: string;
  paymentId: string;
  signature?: string;
  /** Restricts settlement to one user - set on the client-callback path. */
  userId?: string;
}): Promise<SettlementResult> {
  await connectToDatabase();

  const filter: Record<string, unknown> = { razorpayOrderId: params.orderId };
  if (params.userId) filter.userId = new Types.ObjectId(params.userId);

  const transaction = await TransactionModel.findOne(filter);
  if (!transaction) throw errors.notFound("That order");

  const claimed = await TransactionModel.findOneAndUpdate(
    { _id: transaction._id, creditsGranted: false },
    {
      $set: {
        status: "paid" as TransactionStatus,
        creditsGranted: true,
        razorpayPaymentId: params.paymentId,
        ...(params.signature ? { razorpaySignature: params.signature } : {}),
        paidAt: new Date(),
      },
    },
    { returnDocument: "after" },
  );

  if (!claimed) {
    // Someone else already settled this order. Report success without adding
    // credits a second time.
    return {
      credits: null,
      creditsAdded: 0,
      planName: transaction.planName,
      newlyGranted: false,
    };
  }

  const balance = await grantCredits(
    claimed.userId.toString(),
    claimed.credits,
  );

  return {
    credits: balance,
    creditsAdded: claimed.credits,
    planName: claimed.planName,
    newlyGranted: true,
  };
}

/** Checkout success callback. Trusts nothing until the HMAC checks out. */
export async function verifyAndSettlePayment(params: {
  userId: string;
  orderId: string;
  paymentId: string;
  signature: string;
}): Promise<SettlementResult> {
  const valid = verifyPaymentSignature({
    orderId: params.orderId,
    paymentId: params.paymentId,
    signature: params.signature,
  });

  if (!valid) {
    await connectToDatabase();
    await TransactionModel.updateOne(
      { razorpayOrderId: params.orderId, creditsGranted: false },
      { $set: { status: "failed", failureReason: "signature_mismatch" } },
    );
    throw new AppError(
      "PAYMENT_VERIFICATION_FAILED",
      "We could not verify that payment. No credits were added and you have not been charged by us. Contact support if money left your account.",
      400,
    );
  }

  return settleOrder({
    orderId: params.orderId,
    paymentId: params.paymentId,
    signature: params.signature,
    userId: params.userId,
  });
}

/** Webhook path. Signature is verified by the route before this is called. */
export async function settleFromWebhook(params: {
  orderId: string;
  paymentId: string;
}): Promise<SettlementResult> {
  return settleOrder(params);
}

/**
 * Settles any order that was paid but never confirmed back to us.
 *
 * This is the safety net that makes the Razorpay webhook optional. If a user
 * pays and then closes the tab before the browser callback runs, the
 * transaction is stuck at "created" even though money moved. On the next visit
 * to pricing or account we ask Razorpay what actually happened to each recent
 * pending order and grant the credits they already paid for.
 *
 * Payment state comes from Razorpay's API, never from the client, and grants
 * still funnel through the same idempotent `settleOrder` guard.
 */
export async function reconcilePendingOrders(userId: string): Promise<{
  settled: number;
  creditsAdded: number;
}> {
  await connectToDatabase();

  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const pending = await TransactionModel.find({
    userId: new Types.ObjectId(userId),
    creditsGranted: false,
    status: { $in: ["created", "failed"] },
    createdAt: { $gte: cutoff },
  })
    .limit(10)
    .lean();

  let settled = 0;
  let creditsAdded = 0;

  for (const transaction of pending) {
    try {
      const payments = await razorpayClient().orders.fetchPayments(
        transaction.razorpayOrderId,
      );
      const captured = payments.items?.find(
        (payment) => payment.status === "captured",
      );
      if (!captured) continue;

      const result = await settleOrder({
        orderId: transaction.razorpayOrderId,
        paymentId: String(captured.id),
      });

      if (result.newlyGranted) {
        settled += 1;
        creditsAdded += result.creditsAdded;
      }
    } catch (error) {
      // One unreachable order must not stop the rest being reconciled.
      console.error(
        "[payments] reconcile failed for order",
        transaction.razorpayOrderId,
        error,
      );
    }
  }

  return { settled, creditsAdded };
}

export async function markOrderFailed(params: {
  orderId: string;
  reason: string;
  userId?: string;
}): Promise<void> {
  await connectToDatabase();
  const filter: Record<string, unknown> = {
    razorpayOrderId: params.orderId,
    creditsGranted: false,
  };
  if (params.userId) filter.userId = new Types.ObjectId(params.userId);

  await TransactionModel.updateOne(filter, {
    $set: { status: "failed", failureReason: params.reason.slice(0, 300) },
  });
}

export async function markOrderCancelled(params: {
  orderId: string;
  userId: string;
}): Promise<void> {
  await connectToDatabase();
  await TransactionModel.updateOne(
    {
      razorpayOrderId: params.orderId,
      userId: new Types.ObjectId(params.userId),
      creditsGranted: false,
    },
    { $set: { status: "cancelled", failureReason: "dismissed_by_user" } },
  );
}

export async function listTransactions(userId: string): Promise<TransactionView[]> {
  await connectToDatabase();

  const docs = await TransactionModel.find({ userId: new Types.ObjectId(userId) })
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();

  return docs.map((doc) => ({
    id: doc._id.toString(),
    planName: doc.planName,
    amount: doc.amount / 100,
    credits: doc.credits,
    status: doc.status as TransactionStatus,
    creditsGranted: doc.creditsGranted,
    paymentId: doc.razorpayPaymentId ?? null,
    createdAt: doc.createdAt.toISOString(),
  }));
}
