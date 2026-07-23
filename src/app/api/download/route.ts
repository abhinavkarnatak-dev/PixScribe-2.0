import { NextResponse } from "next/server";
import { withRouteErrors } from "@/lib/api/response";
import { errors } from "@/lib/errors";

export const runtime = "nodejs";

/**
 * Streams a stored image back with a `Content-Disposition: attachment` header.
 *
 * A plain `<a download>` pointing at the Cloudinary origin is ignored by
 * browsers for cross-origin URLs, so downloads would silently open a new tab
 * instead. Proxying through same-origin makes the attachment header apply.
 *
 * The URL is restricted to our own Cloudinary delivery host so this cannot be
 * turned into an open proxy for arbitrary outbound requests.
 */
export const GET = withRouteErrors(async (request: Request) => {
  const url = new URL(request.url);
  const target = url.searchParams.get("url");
  const filename = (url.searchParams.get("name") ?? "pixscribe").replace(
    /[^a-zA-Z0-9._-]/g,
    "-",
  );

  if (!target) throw errors.validation({ url: ["Missing image URL."] });

  let parsed: URL;
  try {
    parsed = new URL(target);
  } catch {
    throw errors.validation({ url: ["That is not a valid URL."] });
  }

  if (parsed.protocol !== "https:" || parsed.hostname !== "res.cloudinary.com") {
    throw errors.forbidden();
  }

  const upstream = await fetch(parsed.toString());
  if (!upstream.ok || !upstream.body) throw errors.notFound("That image");

  return new NextResponse(upstream.body, {
    headers: {
      "Content-Type": upstream.headers.get("content-type") ?? "image/png",
      "Content-Disposition": `attachment; filename="${filename}.png"`,
      "Cache-Control": "private, max-age=0, no-store",
    },
  });
});
