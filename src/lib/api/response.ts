import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { AppError, errors } from "@/lib/errors";
import { fieldErrors } from "@/lib/validation/schemas";

export interface ApiErrorBody {
  ok: false;
  code: string;
  message: string;
  details?: Record<string, string[]>;
}

export type ApiSuccessBody<T> = { ok: true } & T;

export function ok<T extends object>(data: T, init?: ResponseInit) {
  return NextResponse.json<ApiSuccessBody<T>>({ ok: true, ...data }, init);
}

export function fail(error: AppError) {
  const body: ApiErrorBody = {
    ok: false,
    code: error.code,
    message: error.message,
  };
  if (error.details) body.details = error.details;

  const headers = new Headers();
  if (error.retryAfter !== undefined) {
    headers.set("Retry-After", String(error.retryAfter));
  }
  return NextResponse.json(body, { status: error.status, headers });
}

/**
 * Wraps a route handler so no unexpected throw escapes as an HTML error page
 * and no stack trace or driver message reaches the client.
 */
export function withRouteErrors<Args extends unknown[]>(
  handler: (...args: Args) => Promise<NextResponse>,
) {
  return async (...args: Args): Promise<NextResponse> => {
    try {
      return await handler(...args);
    } catch (error) {
      if (error instanceof AppError) return fail(error);
      if (error instanceof ZodError) return fail(errors.validation(fieldErrors(error)));

      console.error("[api] unhandled error", error);
      return fail(errors.internal());
    }
  };
}

/** Parses a JSON body, treating a malformed one as a validation failure. */
export async function readJson(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    throw errors.validation({ form: ["Request body must be valid JSON."] });
  }
}
