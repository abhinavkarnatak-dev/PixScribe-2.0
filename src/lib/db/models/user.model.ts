import "server-only";
import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";
import { FREE_SIGNUP_CREDITS } from "@/config/plans";

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 60 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    /** bcrypt hash. Never selected by default so it cannot leak through a stray find(). */
    passwordHash: { type: String, required: true, select: false },
    credits: { type: Number, required: true, default: FREE_SIGNUP_CREDITS, min: 0 },
    /** Lifetime counters, useful for the account page and support queries. */
    totalGenerated: { type: Number, required: true, default: 0 },
    totalCreditsPurchased: { type: Number, required: true, default: 0 },
  },
  { timestamps: true },
);

export type UserDocument = InferSchemaType<typeof userSchema> & {
  _id: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
};

export const UserModel: Model<UserDocument> =
  (mongoose.models.User as Model<UserDocument>) ??
  mongoose.model<UserDocument>("User", userSchema);
