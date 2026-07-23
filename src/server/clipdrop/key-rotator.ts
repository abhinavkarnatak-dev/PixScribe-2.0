import "server-only";
import { connectToDatabase } from "@/lib/db/connect";
import { ApiKeyStateModel } from "@/lib/db/models/api-key-state.model";
import { getClipdropKeys } from "@/lib/env";

/**
 * Round-robin rotation across the six ClipDrop keys.
 *
 * Two properties matter here, and v1 had neither:
 *
 *   1. The cursor lives in Mongo and is advanced with an atomic `$inc`, so
 *      rotation stays fair across cold starts and concurrent lambdas. Two
 *      simultaneous requests are guaranteed to receive different slots.
 *   2. A key that fails is put on cooldown and skipped, so the caller can fall
 *      through to the next key instead of failing the whole generation.
 */

const STATE_KEY = "clipdrop";

/** How long a key sits out after a failure, by failure class. */
const COOLDOWN_MS = {
  /** Quota exhausted or payment required - likely to stay broken for a while. */
  exhausted: 60 * 60 * 1000,
  /** Rate limited - short breather is enough. */
  throttled: 2 * 60 * 1000,
  /** Bad credentials - almost certainly a config problem, back off hard. */
  invalid: 6 * 60 * 60 * 1000,
  /** Anything else (network blip, 5xx). */
  transient: 30 * 1000,
} as const;

export type KeyFailureKind = keyof typeof COOLDOWN_MS;

export interface RotationSlot {
  index: number;
  key: string;
}

async function loadState() {
  await connectToDatabase();
  return ApiKeyStateModel.findOneAndUpdate(
    { key: STATE_KEY },
    { $setOnInsert: { key: STATE_KEY, cursor: 0, keys: [] } },
    { upsert: true, returnDocument: "after", setDefaultsOnInsert: true },
  ).lean();
}

/**
 * Returns every configured key ordered by rotation preference, starting at the
 * next cursor position and skipping keys still on cooldown.
 *
 * Cooling keys are appended at the end rather than dropped: if every key is
 * cooling we would rather attempt a stale one than refuse the request outright.
 */
export async function getRotationOrder(): Promise<RotationSlot[]> {
  const keys = getClipdropKeys();
  if (keys.length === 0) return [];

  const state = await ApiKeyStateModel.findOneAndUpdate(
    { key: STATE_KEY },
    { $inc: { cursor: 1 }, $setOnInsert: { key: STATE_KEY, keys: [] } },
    { upsert: true, returnDocument: "after", setDefaultsOnInsert: true },
  ).lean();

  // `$inc` returns the already-incremented value, so subtract one to make the
  // very first request of a fresh deployment start at slot 0.
  const start = ((state?.cursor ?? 1) - 1) % keys.length;
  const now = Date.now();

  const health = new Map(
    (state?.keys ?? []).map((entry) => [entry.index, entry.cooldownUntil]),
  );

  const healthy: RotationSlot[] = [];
  const cooling: RotationSlot[] = [];

  for (let offset = 0; offset < keys.length; offset += 1) {
    const index = (start + offset) % keys.length;
    const slot: RotationSlot = { index, key: keys[index]! };
    const cooldownUntil = health.get(index);
    if (cooldownUntil && cooldownUntil.getTime() > now) {
      cooling.push(slot);
    } else {
      healthy.push(slot);
    }
  }

  return [...healthy, ...cooling];
}

export async function markKeyFailure(
  index: number,
  kind: KeyFailureKind,
  reason: string,
): Promise<void> {
  const cooldownUntil = new Date(Date.now() + COOLDOWN_MS[kind]);
  await connectToDatabase();

  // Try to update the existing health entry first; if this key has never
  // failed before, push a fresh entry instead.
  const updated = await ApiKeyStateModel.updateOne(
    { key: STATE_KEY, "keys.index": index },
    {
      $inc: { "keys.$.failureCount": 1 },
      $set: {
        "keys.$.cooldownUntil": cooldownUntil,
        "keys.$.lastError": reason.slice(0, 300),
        "keys.$.lastFailureAt": new Date(),
      },
    },
  );

  if (updated.matchedCount === 0) {
    await ApiKeyStateModel.updateOne(
      { key: STATE_KEY },
      {
        $push: {
          keys: {
            index,
            failureCount: 1,
            cooldownUntil,
            lastError: reason.slice(0, 300),
            lastFailureAt: new Date(),
          },
        },
      },
      { upsert: true },
    );
  }
}

/** Clears a key's cooldown after it serves a request successfully. */
export async function markKeySuccess(index: number): Promise<void> {
  await connectToDatabase();
  await ApiKeyStateModel.updateOne(
    { key: STATE_KEY, "keys.index": index },
    { $set: { "keys.$.failureCount": 0, "keys.$.cooldownUntil": null } },
  );
}

/** Read-only snapshot, used by the health endpoint. */
export async function getKeyHealth() {
  const state = await loadState();
  const keys = getClipdropKeys();
  const now = Date.now();
  return keys.map((_, index) => {
    const entry = state?.keys?.find((item) => item.index === index);
    const coolingUntil = entry?.cooldownUntil?.getTime() ?? 0;
    return {
      index,
      healthy: coolingUntil <= now,
      failureCount: entry?.failureCount ?? 0,
      cooldownUntil: coolingUntil > now ? new Date(coolingUntil).toISOString() : null,
    };
  });
}
