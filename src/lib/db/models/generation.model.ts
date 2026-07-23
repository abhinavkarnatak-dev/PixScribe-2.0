import "server-only";
import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const generationSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    /** Exactly what the user typed, without any preset modifier. */
    prompt: { type: String, required: true, maxlength: 1000 },
    presetId: { type: String, required: true, default: "none" },
    imageUrl: { type: String, required: true },
    /** Cloudinary public id, needed to delete the asset when the user deletes the generation. */
    storagePublicId: { type: String, required: true },
    width: { type: Number },
    height: { type: Number },
    /** Which rotation slot served this request. Useful for quota debugging. */
    apiKeyIndex: { type: Number },
    /** End-to-end generation time in milliseconds. */
    durationMs: { type: Number },
    isPublic: { type: Boolean, required: true, default: false, index: true },
  },
  { timestamps: true },
);

// Gallery reads are always "this user's generations, newest first".
generationSchema.index({ userId: 1, createdAt: -1 });
// The public showcase feed reads "public generations, newest first".
generationSchema.index({ isPublic: 1, createdAt: -1 });

export type GenerationDocument = InferSchemaType<typeof generationSchema> & {
  _id: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
};

export const GenerationModel: Model<GenerationDocument> =
  (mongoose.models.Generation as Model<GenerationDocument>) ??
  mongoose.model<GenerationDocument>("Generation", generationSchema);
