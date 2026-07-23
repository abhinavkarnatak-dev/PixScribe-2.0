import "server-only";
import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

/**
 * Fixed-window rate limit counters.
 *
 * Backed by Mongo rather than process memory so the limit holds across
 * serverless instances. Expired windows are reaped by a TTL index.
 */

const rateLimitSchema = new Schema({
  /** `${scope}:${identifier}:${windowStart}` */
  key: { type: String, required: true, unique: true },
  count: { type: Number, required: true, default: 0 },
  expiresAt: { type: Date, required: true },
});

rateLimitSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export type RateLimitDocument = InferSchemaType<typeof rateLimitSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const RateLimitModel: Model<RateLimitDocument> =
  (mongoose.models.RateLimit as Model<RateLimitDocument>) ??
  mongoose.model<RateLimitDocument>("RateLimit", rateLimitSchema);
