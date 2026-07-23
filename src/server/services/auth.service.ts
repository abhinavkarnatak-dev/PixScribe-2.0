import "server-only";
import { Types } from "mongoose";
import { connectToDatabase } from "@/lib/db/connect";
import { UserModel } from "@/lib/db/models/user.model";
import { AppError, errors } from "@/lib/errors";
import { fakePasswordCheck, hashPassword, verifyPassword } from "@/lib/auth/password";
import type { SessionPayload } from "@/lib/auth/session";

export interface PublicUser {
  id: string;
  name: string;
  email: string;
  credits: number;
  totalGenerated: number;
  totalCreditsPurchased: number;
  memberSince: string;
}

export async function registerUser(input: {
  name: string;
  email: string;
  password: string;
}): Promise<{ session: SessionPayload; user: PublicUser }> {
  await connectToDatabase();

  const existing = await UserModel.exists({ email: input.email });
  if (existing) {
    throw new AppError(
      "EMAIL_TAKEN",
      "An account with that email already exists.",
      409,
      { details: { email: ["An account with that email already exists."] } },
    );
  }

  const passwordHash = await hashPassword(input.password);

  try {
    const user = await UserModel.create({
      name: input.name,
      email: input.email,
      passwordHash,
    });

    return {
      session: { userId: user._id.toString(), email: user.email, name: user.name },
      user: toPublicUser(user.toObject()),
    };
  } catch (error) {
    // The unique index is the real guard - the exists() check above only makes
    // the common case give a nicer message.
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code: number }).code === 11000
    ) {
      throw new AppError(
        "EMAIL_TAKEN",
        "An account with that email already exists.",
        409,
        { details: { email: ["An account with that email already exists."] } },
      );
    }
    throw error;
  }
}

export async function authenticateUser(input: {
  email: string;
  password: string;
}): Promise<{ session: SessionPayload; user: PublicUser }> {
  await connectToDatabase();

  const user = await UserModel.findOne({ email: input.email }).select("+passwordHash");

  if (!user) {
    // Spend the same time as a real hash comparison, then return the identical
    // message the wrong-password branch uses, so neither timing nor wording
    // reveals whether the email is registered.
    await fakePasswordCheck();
    throw new AppError(
      "INVALID_CREDENTIALS",
      "That email and password combination is not right.",
      401,
    );
  }

  const matches = await verifyPassword(input.password, user.passwordHash);
  if (!matches) {
    throw new AppError(
      "INVALID_CREDENTIALS",
      "That email and password combination is not right.",
      401,
    );
  }

  return {
    session: { userId: user._id.toString(), email: user.email, name: user.name },
    user: toPublicUser(user.toObject()),
  };
}

export async function getUserById(userId: string): Promise<PublicUser> {
  await connectToDatabase();
  if (!Types.ObjectId.isValid(userId)) throw errors.notFound("Your account");
  const user = await UserModel.findById(userId).lean();
  if (!user) throw errors.notFound("Your account");
  return toPublicUser(user);
}

export async function changePassword(params: {
  userId: string;
  currentPassword: string;
  newPassword: string;
}): Promise<void> {
  await connectToDatabase();

  const user = await UserModel.findById(params.userId).select("+passwordHash");
  if (!user) throw errors.notFound("Your account");

  const matches = await verifyPassword(params.currentPassword, user.passwordHash);
  if (!matches) {
    throw new AppError("INVALID_CREDENTIALS", "That is not your current password.", 401, {
      details: { currentPassword: ["That is not your current password."] },
    });
  }

  user.passwordHash = await hashPassword(params.newPassword);
  await user.save();
}

interface UserRecord {
  _id: Types.ObjectId;
  name: string;
  email: string;
  credits: number;
  totalGenerated: number;
  totalCreditsPurchased: number;
  createdAt: Date;
}

function toPublicUser(user: UserRecord): PublicUser {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    credits: user.credits,
    totalGenerated: user.totalGenerated,
    totalCreditsPurchased: user.totalCreditsPurchased,
    memberSince: user.createdAt.toISOString(),
  };
}
