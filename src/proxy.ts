import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

/**
 * Route gating. (Next.js 16 renamed the middleware convention to `proxy`.)
 *
 * This is an optimistic check only - it keeps signed-out users from seeing the
 * app shell flash before a redirect. Real authorisation happens in the route
 * handlers and services via `requireSession`, which never trusts this layer.
 */

const PROTECTED_PREFIXES = ["/studio", "/gallery", "/account"];
const AUTH_ROUTES = ["/login", "/signup"];
const SESSION_COOKIE = "pixscribe_session";

async function hasValidSession(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  const secret = process.env.JWT_SECRET;
  if (!secret) return false;

  try {
    await jwtVerify(token, new TextEncoder().encode(secret), {
      issuer: "pixscribe",
      audience: "pixscribe-web",
    });
    return true;
  } catch {
    return false;
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
  const isAuthRoute = AUTH_ROUTES.includes(pathname);

  if (!isProtected && !isAuthRoute) return NextResponse.next();

  const signedIn = await hasValidSession(
    request.cookies.get(SESSION_COOKIE)?.value,
  );

  if (isProtected && !signedIn) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    // Preserve where they were heading so login can send them back.
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (isAuthRoute && signedIn) {
    const url = request.nextUrl.clone();
    url.pathname = "/studio";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/studio/:path*", "/gallery/:path*", "/account/:path*", "/login", "/signup"],
};
