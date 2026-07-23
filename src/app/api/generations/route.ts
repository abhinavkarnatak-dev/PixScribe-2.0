import { ok, withRouteErrors } from "@/lib/api/response";
import { requireSession } from "@/lib/auth/guard";
import { listUserGenerations } from "@/server/services/generation.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = withRouteErrors(async (request: Request) => {
  const session = await requireSession();
  const url = new URL(request.url);

  const page = await listUserGenerations({
    userId: session.userId,
    cursor: url.searchParams.get("cursor"),
    limit: Number(url.searchParams.get("limit")) || undefined,
  });

  return ok(page);
});
