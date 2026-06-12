// ============================================================
// MIDDLEWARE
// File: src/middleware.ts (must be at src/ root or project root)
//
// LEARNING: Middleware runs on EVERY request before the page
// renders. It runs on the Edge Runtime — no Node.js APIs.
// Use it for: auth checks, redirects, A/B testing, rate limiting.
//
// CRITICAL: Middleware runs BEFORE Server Components.
// It can read/write cookies and redirect before any React renders.
//
// COMMON MISTAKE: Don't do heavy DB work in middleware.
// It runs on every request including static assets.
// Use the matcher config to limit which paths it runs on.
//
// PRODUCTION PATTERN:
// 1. Verify JWT from cookie (Edge-compatible, e.g. jose library)
// 2. Redirect unauthenticated users to /login
// 3. Redirect authenticated users away from /login
// ============================================================

import { NextRequest, NextResponse } from "next/server";

const PUBLIC_PATHS = ["/login", "/register", "/forgot-password"];
const AUTH_PATHS = ["/login", "/register", "/forgot-password"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = request.cookies.get("session");
  const isAuthenticated = !!session;

  // Redirect authenticated users away from auth pages
  if (isAuthenticated && AUTH_PATHS.includes(pathname)) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Redirect unauthenticated users to login
  if (!isAuthenticated && !PUBLIC_PATHS.includes(pathname)) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  // Run middleware only on these paths — NOT on API routes,
  // static files, or Next.js internals.
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).)*"],
};
