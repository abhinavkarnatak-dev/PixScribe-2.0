import "server-only";
import { AppError } from "@/lib/errors";
import {
  getRotationOrder,
  markKeyFailure,
  markKeySuccess,
  type KeyFailureKind,
} from "@/server/clipdrop/key-rotator";

const CLIPDROP_ENDPOINT = "https://clipdrop-api.co/text-to-image/v1";
const REQUEST_TIMEOUT_MS = 60_000;

export interface ClipdropResult {
  bytes: Buffer;
  contentType: string;
  /** Rotation slot that actually produced the image. */
  apiKeyIndex: number;
}

/** Maps an HTTP status onto a failure class, which decides the cooldown length. */
function classify(status: number): { kind: KeyFailureKind; retryNextKey: boolean } {
  if (status === 401 || status === 403) return { kind: "invalid", retryNextKey: true };
  if (status === 402) return { kind: "exhausted", retryNextKey: true };
  if (status === 429) return { kind: "throttled", retryNextKey: true };
  if (status >= 500) return { kind: "transient", retryNextKey: true };
  // 4xx other than the above means the request itself is bad - a different key
  // will not help, so stop rotating and surface the rejection.
  return { kind: "transient", retryNextKey: false };
}

async function callClipdrop(
  key: string,
  prompt: string,
  signal: AbortSignal,
): Promise<Response> {
  const form = new FormData();
  form.append("prompt", prompt);

  return fetch(CLIPDROP_ENDPOINT, {
    method: "POST",
    headers: { "x-api-key": key },
    body: form,
    signal,
  });
}

/**
 * Generates an image, walking the key rotation until one succeeds.
 *
 * The first key comes from the shared round-robin cursor, so ordinary traffic
 * still spreads evenly across all six. Failover only kicks in when a key
 * actually errors, and the failing key is put on cooldown so subsequent
 * requests skip it rather than rediscovering the failure.
 */
export async function generateImage(prompt: string): Promise<ClipdropResult> {
  const slots = await getRotationOrder();

  if (slots.length === 0) {
    throw new AppError(
      "PROVIDER_UNAVAILABLE",
      "Image generation is not configured. Please try again later.",
      503,
    );
  }

  let lastFailure: AppError | null = null;

  for (const slot of slots) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const response = await callClipdrop(slot.key, prompt, controller.signal);

      if (response.ok) {
        const buffer = Buffer.from(await response.arrayBuffer());
        if (buffer.byteLength === 0) {
          throw new Error("provider returned an empty body");
        }
        // Do not block the response on the bookkeeping write.
        void markKeySuccess(slot.index).catch(() => {});
        return {
          bytes: buffer,
          contentType: response.headers.get("content-type") ?? "image/png",
          apiKeyIndex: slot.index,
        };
      }

      const detail = (await response.text().catch(() => "")).slice(0, 300);
      const { kind, retryNextKey } = classify(response.status);
      await markKeyFailure(slot.index, kind, `HTTP ${response.status}: ${detail}`);

      if (!retryNextKey) {
        throw new AppError(
          "PROVIDER_REJECTED",
          "The generator could not process that prompt. Try rewording it.",
          422,
        );
      }

      lastFailure = new AppError(
        "PROVIDER_UNAVAILABLE",
        "The image generator is busy right now. Please try again in a moment.",
        503,
      );
    } catch (error) {
      // A deliberate rejection must not be swallowed by the retry loop.
      if (error instanceof AppError) throw error;

      const reason = error instanceof Error ? error.message : "unknown error";
      await markKeyFailure(slot.index, "transient", reason);
      lastFailure = new AppError(
        "PROVIDER_UNAVAILABLE",
        "The image generator is not responding. Please try again in a moment.",
        503,
      );
    } finally {
      clearTimeout(timeout);
    }
  }

  throw (
    lastFailure ??
    new AppError(
      "PROVIDER_UNAVAILABLE",
      "The image generator is unavailable. Please try again shortly.",
      503,
    )
  );
}
