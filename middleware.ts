import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── Admin auth ────────────────────────────────────────────
  if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
    if (pathname === "/admin/login" || pathname.startsWith("/api/admin/auth")) {
      return NextResponse.next();
    }

    const token = request.cookies.get("cp_admin")?.value;
    if (!token) {
      if (pathname.startsWith("/api/admin/")) {
        return new NextResponse(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { "Content-Type": "application/json" },
        });
      }
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }

    return NextResponse.next();
  }

  // ── Visitor tracking for public pages ────────────────────
  let sessionId = request.cookies.get("cp_sid")?.value;
  const isNewSession = !sessionId;
  if (!sessionId) sessionId = crypto.randomUUID();

  const response = NextResponse.next();

  if (isNewSession) {
    response.cookies.set("cp_sid", sessionId, {
      maxAge: 60 * 60 * 24 * 30,
      httpOnly: true,
      sameSite: "lax",
    });
  }

  fetch(`${request.nextUrl.origin}/api/track`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-internal-secret": process.env.INTERNAL_SECRET ?? "dev",
    },
    body: JSON.stringify({
      path: pathname,
      country: request.headers.get("x-vercel-ip-country") ?? null,
      city: request.headers.get("x-vercel-ip-city") ?? null,
      session_id: sessionId,
      referrer: request.headers.get("referer") ?? null,
      user_agent: request.headers.get("user-agent") ?? null,
    }),
  }).catch(() => {});

  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*", "/", "/gallery", "/create"],
};
