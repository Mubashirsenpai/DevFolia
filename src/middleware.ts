import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const COOKIE_NAME = "portfolio_session";

function getSecretKey(): Uint8Array {
  const s = process.env.ADMIN_SESSION_SECRET ?? "";
  const key =
    s.length >= 32
      ? s
      : "dev-only-unsafe-secret-use-env-32chars-min!";
  return new TextEncoder().encode(key);
}

export async function middleware(request: NextRequest) {
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
      await jwtVerify(token, getSecretKey());
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
      await jwtVerify(token, getSecretKey());
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
  matcher: ["/admin/:path*"],
};
