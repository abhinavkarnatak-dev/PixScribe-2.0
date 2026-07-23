import "server-only";
import { Types } from "mongoose";
import { connectToDatabase } from "@/lib/db/connect";
import { UserModel } from "@/lib/db/models/user.model";
import { errors } from "@/lib/errors";

/**
 * Credit accounting.
 *
 * Every mutation here is a single conditional update, never a read followed by
 * a write. That is what makes concurrent generations safe: v1 read the balance,
 * called ClipDrop, then wrote `balance - 1`, so two requests firing together
 * both read the same balance and both got an image for one credit.
 */

export interface CreditReservation {
  /** Balance remaining *after* the reservation. */
  remaining: number;
}

/**
 * Atomically takes one credit, but only if the user actually has one.
 *
 * The `credits: { $gte: 1 }` filter and the `$inc` are evaluated together by
 * Mongo under a document lock, so exactly one of two simultaneous requests can
 * win when the balance is 1.
 */
export async function reserveCredit(userId: string): Promise<CreditReservation> {
  await connectToDatabase();

  const updated = await UserModel.findOneAndUpdate(
    { _id: new Types.ObjectId(userId), credits: { $gte: 1 } },
    { $inc: { credits: -1 } },
    { returnDocument: "after", projection: { credits: 1 } },
  ).lean();

  if (!updated) {
    // Either the user is gone or the balance was zero. Distinguish the two so
    // the client can route an out-of-credits user to the pricing page.
    const exists = await UserModel.exists({ _id: new Types.ObjectId(userId) });
    if (!exists) throw errors.notFound("Your account");
    throw errors.insufficientCredits();
  }

  return { remaining: updated.credits };
}

/** Returns a reserved credit after a downstream failure. */
export async function refundCredit(userId: string): Promise<number | null> {
  await connectToDatabase();
  const updated = await UserModel.findOneAndUpdate(
    { _id: new Types.ObjectId(userId) },
    { $inc: { credits: 1 } },
    { returnDocument: "after", projection: { credits: 1 } },
  ).lean();
  return updated?.credits ?? null;
}

/** Records a successful generation against the user's lifetime counter. */
export async function recordGeneration(userId: string): Promise<void> {
  await connectToDatabase();
  await UserModel.updateOne(
    { _id: new Types.ObjectId(userId) },
    { $inc: { totalGenerated: 1 } },
  );
}

/** Adds purchased credits. Only ever called from a verified payment path. */
export async function grantCredits(userId: string, credits: number): Promise<number | null> {
  await connectToDatabase();
  const updated = await UserModel.findOneAndUpdate(
    { _id: new Types.ObjectId(userId) },
    { $inc: { credits, totalCreditsPurchased: credits } },
    { returnDocument: "after", projection: { credits: 1 } },
  ).lean();
  return updated?.credits ?? null;
}

export async function getBalance(userId: string): Promise<number> {
  await connectToDatabase();
  const user = await UserModel.findById(userId, { credits: 1 }).lean();
  if (!user) throw errors.notFound("Your account");
  return user.credits;
}
