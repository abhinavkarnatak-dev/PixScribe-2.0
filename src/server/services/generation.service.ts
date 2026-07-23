import "server-only";
import { Types } from "mongoose";
import { connectToDatabase } from "@/lib/db/connect";
import { GenerationModel } from "@/lib/db/models/generation.model";
import { composePrompt } from "@/config/presets";
import { errors } from "@/lib/errors";
import { generateImage as callProvider } from "@/server/clipdrop/client";
import {
  deleteStoredImage,
  thumbnailUrl,
  uploadGeneratedImage,
} from "@/server/storage/cloudinary";
import {
  recordGeneration,
  refundCredit,
  reserveCredit,
} from "@/server/services/credit.service";

export interface GenerationView {
  id: string;
  prompt: string;
  presetId: string;
  imageUrl: string;
  thumbnailUrl: string;
  width: number | null;
  height: number | null;
  isPublic: boolean;
  createdAt: string;
}

export interface GenerateResult {
  generation: GenerationView;
  credits: number;
}

interface GenerationRecord {
  _id: Types.ObjectId;
  prompt: string;
  presetId: string;
  imageUrl: string;
  width?: number | null;
  height?: number | null;
  isPublic: boolean;
  createdAt: Date;
}

function toView(doc: GenerationRecord): GenerationView {
  return {
    id: doc._id.toString(),
    prompt: doc.prompt,
    presetId: doc.presetId,
    imageUrl: doc.imageUrl,
    thumbnailUrl: thumbnailUrl(doc.imageUrl),
    width: doc.width ?? null,
    height: doc.height ?? null,
    isPublic: doc.isPublic,
    createdAt: doc.createdAt.toISOString(),
  };
}

/**
 * The full generation transaction.
 *
 * Ordering is deliberate: the credit is reserved *before* any provider work, so
 * a burst of concurrent requests cannot overspend a balance. Every failure path
 * after that point refunds the credit, so a user is never charged for an image
 * they did not receive.
 */
export async function createGeneration(params: {
  userId: string;
  prompt: string;
  presetId?: string;
}): Promise<GenerateResult> {
  const { userId, prompt, presetId = "none" } = params;

  const reservation = await reserveCredit(userId);
  const startedAt = Date.now();

  try {
    const composed = composePrompt(prompt, presetId);
    const image = await callProvider(composed);
    const stored = await uploadGeneratedImage(image.bytes, userId);

    await connectToDatabase();
    const doc = await GenerationModel.create({
      userId: new Types.ObjectId(userId),
      // Store the user's own words, not the preset-expanded prompt, so the
      // gallery shows what they actually typed.
      prompt,
      presetId,
      imageUrl: stored.url,
      storagePublicId: stored.publicId,
      width: stored.width,
      height: stored.height,
      apiKeyIndex: image.apiKeyIndex,
      durationMs: Date.now() - startedAt,
      isPublic: false,
    });

    await recordGeneration(userId);

    return {
      generation: toView(doc.toObject() as unknown as GenerationRecord),
      credits: reservation.remaining,
    };
  } catch (error) {
    // Give the credit back before rethrowing so the client's balance update
    // reflects reality.
    await refundCredit(userId).catch(() => {});
    throw error;
  }
}

export interface GalleryPage {
  items: GenerationView[];
  nextCursor: string | null;
}

/** Cursor pagination on `createdAt`, avoiding skip/limit drift as new rows land. */
export async function listUserGenerations(params: {
  userId: string;
  limit?: number;
  cursor?: string | null;
}): Promise<GalleryPage> {
  const { userId, cursor } = params;
  const limit = Math.min(Math.max(params.limit ?? 24, 1), 48);

  await connectToDatabase();

  const filter: Record<string, unknown> = { userId: new Types.ObjectId(userId) };
  if (cursor) {
    const parsed = new Date(cursor);
    if (!Number.isNaN(parsed.getTime())) filter.createdAt = { $lt: parsed };
  }

  const docs = await GenerationModel.find(filter)
    .sort({ createdAt: -1 })
    .limit(limit + 1)
    .lean<GenerationRecord[]>();

  const hasMore = docs.length > limit;
  const page = hasMore ? docs.slice(0, limit) : docs;

  return {
    items: page.map(toView),
    nextCursor: hasMore ? page[page.length - 1]!.createdAt.toISOString() : null,
  };
}

export async function listPublicGenerations(params: {
  limit?: number;
  cursor?: string | null;
}): Promise<GalleryPage> {
  const limit = Math.min(Math.max(params.limit ?? 24, 1), 48);

  await connectToDatabase();

  const filter: Record<string, unknown> = { isPublic: true };
  if (params.cursor) {
    const parsed = new Date(params.cursor);
    if (!Number.isNaN(parsed.getTime())) filter.createdAt = { $lt: parsed };
  }

  const docs = await GenerationModel.find(filter)
    .sort({ createdAt: -1 })
    .limit(limit + 1)
    .lean<GenerationRecord[]>();

  const hasMore = docs.length > limit;
  const page = hasMore ? docs.slice(0, limit) : docs;

  return {
    items: page.map(toView),
    nextCursor: hasMore ? page[page.length - 1]!.createdAt.toISOString() : null,
  };
}

export async function setGenerationVisibility(params: {
  userId: string;
  generationId: string;
  isPublic: boolean;
}): Promise<GenerationView> {
  const { userId, generationId, isPublic } = params;
  if (!Types.ObjectId.isValid(generationId)) throw errors.notFound("That image");

  await connectToDatabase();

  // Scoping the filter by userId is the authorisation check - a mismatched
  // owner simply matches nothing.
  const doc = await GenerationModel.findOneAndUpdate(
    { _id: new Types.ObjectId(generationId), userId: new Types.ObjectId(userId) },
    { $set: { isPublic } },
    { returnDocument: "after" },
  ).lean<GenerationRecord | null>();

  if (!doc) throw errors.notFound("That image");
  return toView(doc);
}

export async function deleteGeneration(params: {
  userId: string;
  generationId: string;
}): Promise<void> {
  const { userId, generationId } = params;
  if (!Types.ObjectId.isValid(generationId)) throw errors.notFound("That image");

  await connectToDatabase();

  const doc = await GenerationModel.findOneAndDelete({
    _id: new Types.ObjectId(generationId),
    userId: new Types.ObjectId(userId),
  }).lean<{ storagePublicId: string } | null>();

  if (!doc) throw errors.notFound("That image");

  await deleteStoredImage(doc.storagePublicId);
}

export async function countUserGenerations(userId: string): Promise<number> {
  await connectToDatabase();
  return GenerationModel.countDocuments({ userId: new Types.ObjectId(userId) });
}
