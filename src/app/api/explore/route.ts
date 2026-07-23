import { ok, withRouteErrors } from "@/lib/api/response";
import { listPublicGenerations } from "@/server/services/generation.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Public feed - deliberately unauthenticated, and never exposes author identity. */
export const GET = withRouteErrors(async (request: Request) => {
  const url = new URL(request.url);

  const page = await listPublicGenerations({
    cursor: url.searchParams.get("cursor"),
    limit: Number(url.searchParams.get("limit")) || undefined,
  });

  return ok(page);
});
