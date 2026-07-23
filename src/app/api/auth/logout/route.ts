import { ok, withRouteErrors } from "@/lib/api/response";
import { clearSessionCookie } from "@/lib/auth/session";

export const runtime = "nodejs";

export const POST = withRouteErrors(async () => {
  await clearSessionCookie();
  return ok({});
});
