import type { ErrorCode } from "@/lib/errors";

/**
 * Browser-side API client.
 *
 * Every failed response is normalised into an `ApiClientError` carrying the
 * server's stable `code`, so UI can branch on the code (route an
 * INSUFFICIENT_CREDITS user to pricing, map VALIDATION_ERROR details onto form
 * fields) instead of matching on message text.
 */

export class ApiClientError extends Error {
  readonly code: ErrorCode | "NETWORK_ERROR";
  readonly status: number;
  readonly details?: Record<string, string[]>;

  constructor(
    code: ErrorCode | "NETWORK_ERROR",
    message: string,
    status: number,
    details?: Record<string, string[]>,
  ) {
    super(message);
    this.name = "ApiClientError";
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

interface RequestOptions {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  signal?: AbortSignal;
}

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { method = "GET", body, signal } = options;

  let response: Response;
  try {
    response = await fetch(path, {
      method,
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
      signal,
      credentials: "same-origin",
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") throw error;
    throw new ApiClientError(
      "NETWORK_ERROR",
      "Could not reach the server. Check your connection and try again.",
      0,
    );
  }

  let payload: unknown = null;
  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    payload = await response.json().catch(() => null);
  }

  if (!response.ok) {
    const body = payload as {
      code?: ErrorCode;
      message?: string;
      details?: Record<string, string[]>;
    } | null;

    throw new ApiClientError(
      body?.code ?? "INTERNAL_ERROR",
      body?.message ?? "Something went wrong. Please try again.",
      response.status,
      body?.details,
    );
  }

  return payload as T;
}
