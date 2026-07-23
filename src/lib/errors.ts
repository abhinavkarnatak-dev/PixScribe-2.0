/**
 * Application error taxonomy.
 *
 * Every failure that reaches the client goes through this type, so the UI can
 * branch on a stable `code` instead of pattern-matching error strings, and so
 * internal details never leak into a response body.
 */

export type ErrorCode =
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "VALIDATION_ERROR"
  | "EMAIL_TAKEN"
  | "INVALID_CREDENTIALS"
  | "INSUFFICIENT_CREDITS"
  | "RATE_LIMITED"
  | "PROVIDER_UNAVAILABLE"
  | "PROVIDER_REJECTED"
  | "STORAGE_FAILED"
  | "PAYMENT_VERIFICATION_FAILED"
  | "PAYMENT_FAILED"
  | "INTERNAL_ERROR";

export class AppError extends Error {
  readonly code: ErrorCode;
  readonly status: number;
  readonly details?: Record<string, string[]>;
  /** Seconds until the caller may retry. Only set for RATE_LIMITED. */
  readonly retryAfter?: number;

  constructor(
    code: ErrorCode,
    message: string,
    status: number,
    options?: { details?: Record<string, string[]>; retryAfter?: number },
  ) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.status = status;
    this.details = options?.details;
    this.retryAfter = options?.retryAfter;
  }
}

export const errors = {
  validation: (details: Record<string, string[]>) =>
    new AppError("VALIDATION_ERROR", "Please check the highlighted fields.", 422, {
      details,
    }),
  notFound: (what = "That") => new AppError("NOT_FOUND", `${what} could not be found.`, 404),
  forbidden: () =>
    new AppError("FORBIDDEN", "You do not have access to that resource.", 403),
  insufficientCredits: () =>
    new AppError(
      "INSUFFICIENT_CREDITS",
      "You are out of credits. Top up to keep generating.",
      402,
    ),
  rateLimited: (retryAfter: number) =>
    new AppError(
      "RATE_LIMITED",
      "You are generating a little too fast. Give it a moment.",
      429,
      { retryAfter },
    ),
  internal: () =>
    new AppError("INTERNAL_ERROR", "Something went wrong on our side.", 500),
};
