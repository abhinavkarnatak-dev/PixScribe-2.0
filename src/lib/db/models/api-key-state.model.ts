import "server-only";
import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

/**
 * Persisted state for the ClipDrop key rotator.
 *
 * v1 kept the rotation index in a module-level variable, which resets on every
 * cold start and diverges across instances. Keeping it in Mongo means rotation
 * stays fair no matter how many lambdas are running.
 */

const apiKeyStateSchema = new Schema({
  /** Always the literal string "clipdrop" - this is a single-document collection. */
  key: { type: String, required: true, unique: true },
  /** Monotonically increasing counter; the slot is `cursor % keyCount`. */
  cursor: { type: Number, required: true, default: 0 },
  /**
   * Per-key health. Indexed by rotation slot. A key that returns 401/402/429 is
   * put on cooldown and skipped until `cooldownUntil` passes.
   */
  keys: {
    type: [
      new Schema(
        {
          index: { type: Number, required: true },
          failureCount: { type: Number, required: true, default: 0 },
          lastError: { type: String },
          lastFailureAt: { type: Date },
          cooldownUntil: { type: Date },
        },
        { _id: false },
      ),
    ],
    default: [],
  },
});

export type ApiKeyStateDocument = InferSchemaType<typeof apiKeyStateSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const ApiKeyStateModel: Model<ApiKeyStateDocument> =
  (mongoose.models.ApiKeyState as Model<ApiKeyStateDocument>) ??
  mongoose.model<ApiKeyStateDocument>("ApiKeyState", apiKeyStateSchema);
