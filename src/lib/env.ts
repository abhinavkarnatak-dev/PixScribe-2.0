import "server-only";

/**
 * Central, validated access to server-side configuration.
 *
 * Nothing in this module may be imported from a client component - the
 * `server-only` guard turns any such import into a build error, which is the
 * safety net that keeps API keys out of the browser bundle.
 */

function required(name: string): string {
  const value = process.env[name];
  if (!value || value.trim() === "") {
    throw new Error(
      `Missing required environment variable: ${name}. See .env.example.`,
    );
  }
  return value.trim();
}

function optional(name: string): string | undefined {
  const value = process.env[name];
  return value && value.trim() !== "" ? value.trim() : undefined;
}

/** ClipDrop keys, in rotation order. Blank slots are skipped, not treated as errors. */
export function getClipdropKeys(): string[] {
  return [1, 2, 3, 4, 5, 6]
    .map((n) => optional(`CLIPDROP_API_KEY_${n}`))
    .filter((key): key is string => Boolean(key));
}

export const env = {
  get appUrl() {
    return optional("NEXT_PUBLIC_APP_URL") ?? "http://localhost:3000";
  },
  get mongodbUri() {
    return required("MONGODB_URI");
  },
  get jwtSecret() {
    const secret = required("JWT_SECRET");
    if (secret.length < 32) {
      throw new Error("JWT_SECRET must be at least 32 characters long.");
    }
    return secret;
  },
  get cloudinary() {
    return {
      cloudName: required("CLOUDINARY_CLOUD_NAME"),
      apiKey: required("CLOUDINARY_API_KEY"),
      apiSecret: required("CLOUDINARY_API_SECRET"),
    };
  },
  get razorpay() {
    return {
      keyId: required("RAZORPAY_KEY_ID"),
      keySecret: required("RAZORPAY_KEY_SECRET"),
      /** Optional so local development can run without a tunnelled webhook. */
      webhookSecret: optional("RAZORPAY_WEBHOOK_SECRET"),
    };
  },
  get isProduction() {
    return process.env.NODE_ENV === "production";
  },
} as const;
