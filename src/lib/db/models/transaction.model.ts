import "server-only";
import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

export const TRANSACTION_STATUSES = [
  "created",
  "paid",
  "failed",
  "cancelled",
] as const;

export type TransactionStatus = (typeof TRANSACTION_STATUSES)[number];

const transactionSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    planId: { type: String, required: true },
    planName: { type: String, required: true },
    /** Stored in paise, the unit Razorpay actually charges in. */
    amount: { type: Number, required: true },
    currency: { type: String, required: true, default: "INR" },
    credits: { type: Number, required: true },
    status: {
      type: String,
      required: true,
      enum: TRANSACTION_STATUSES,
      default: "created",
      index: true,
    },
    razorpayOrderId: { type: String, required: true, unique: true, index: true },
    razorpayPaymentId: { type: String },
    razorpaySignature: { type: String },
    /**
     * Set once credits have actually been added to the user's balance. The
     * guard that flips this from false to true is what makes the grant
     * idempotent across the verify endpoint and the webhook firing together.
     */
    creditsGranted: { type: Boolean, required: true, default: false },
    failureReason: { type: String },
    paidAt: { type: Date },
  },
  { timestamps: true },
);

transactionSchema.index({ userId: 1, createdAt: -1 });

export type TransactionDocument = InferSchemaType<typeof transactionSchema> & {
  _id: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
};

export const TransactionModel: Model<TransactionDocument> =
  (mongoose.models.Transaction as Model<TransactionDocument>) ??
  mongoose.model<TransactionDocument>("Transaction", transactionSchema);
