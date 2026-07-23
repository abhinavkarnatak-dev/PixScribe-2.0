import { ok, withRouteErrors } from "@/lib/api/response";
import { readSession } from "@/lib/auth/session";
import { getUserById } from "@/server/services/auth.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = withRouteErrors(async () => {
  const session = await readSession();
  if (!session) return ok({ user: null });

  try {
    const user = await getUserById(session.userId);
    return ok({ user });
  } catch {
    // Cookie references a user that no longer exists - treat as signed out.
    return ok({ user: null });
  }
});
