import "server-only";
import { readSession, type SessionPayload } from "@/lib/auth/session";
import { AppError } from "@/lib/errors";

/**
 * Resolves the current session or throws a 401 AppError.
 * Route handlers wrap themselves in `withRouteErrors`, which turns that into
 * a consistent JSON error response.
 */
export async function requireSession(): Promise<SessionPayload> {
  const session = await readSession();
  if (!session) {
    throw new AppError("UNAUTHORIZED", "You need to be signed in to do that.", 401);
  }
  return session;
}
