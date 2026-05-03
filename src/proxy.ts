import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { getJwtSecretBytes } from "@/lib/session-secret";

const COOKIE_NAME = "portfolio_session";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(COOKIE_NAME)?.value;
  const isPublicAuthRoute =
    pathname.startsWith("/admin/login") ||
    pathname.startsWith("/admin/signup") ||
    pathname.startsWith("/admin/forgot-password") ||
    pathname.startsWith("/admin/reset-password");

  if (isPublicAuthRoute) {
    if (!token) return NextResponse.next();
    if (pathname.startsWith("/admin/forgot-password") || pathname.startsWith("/admin/reset-password")) {
      return NextResponse.next();
    }
    try {
      await jwtVerify(token, getJwtSecretBytes());
      const url = request.nextUrl.clone();
      url.pathname = "/admin";
      return NextResponse.redirect(url);
    } catch {
      return NextResponse.next();
    }
  }

  if (pathname.startsWith("/admin")) {
    if (!token) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      url.searchParams.set("from", pathname);
      return NextResponse.redirect(url);
    }
    try {
      await jwtVerify(token, getJwtSecretBytes());
      return NextResponse.next();
    } catch {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  // Match `/admin` and `/admin/...` (explicit first segment avoids edge cases in matchers).
  matcher: ["/admin", "/admin/:path*"],
};
