// ============================================================
// ROUTE HANDLER: POST /api/auth/login
//
// LEARNING: Route Handlers are the App Router equivalent of
// Next.js API Routes (pages/api/*). They use Web APIs:
// Request/Response instead of req/res.
//
// Key differences from pages/api:
// - Uses native Web Request/Response
// - Can export GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS
// - Can run on Edge Runtime: export const runtime = 'edge'
// - Supports streaming responses
//
// PRODUCTION NOTE: In real apps, use a proper session library
// like Auth.js (NextAuth v5) or Lucia. This is a demo.
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { mockCurrentUser } from "@/lib/mock-data";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Demo: accept any credentials matching mock user
    // PRODUCTION: hash + compare password against DB
    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password are required" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Simulate network delay
    await new Promise((r) => setTimeout(r, 300));

    const response = NextResponse.json({
      data: mockCurrentUser,
      message: "Login successful",
    });

    // Set httpOnly session cookie
    // PRODUCTION: use a signed JWT or session token
    response.cookies.set("session", "mock-session-token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return response;
  } catch {
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
