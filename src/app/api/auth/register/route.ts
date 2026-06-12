import { NextRequest, NextResponse } from "next/server";
import { mockCurrentUser } from "@/lib/mock-data";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password, workspaceName } = body;

    if (!name || !email || !password || !workspaceName) {
      return NextResponse.json({ message: "All fields are required" }, { status: 400 });
    }

    await new Promise((r) => setTimeout(r, 400));

    const newUser = {
      ...mockCurrentUser,
      name,
      email,
      workspace: { ...mockCurrentUser.workspace, name: workspaceName },
    };

    const response = NextResponse.json({
      data: newUser,
      message: "Account created",
    });

    response.cookies.set("session", "mock-session-token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return response;
  } catch {
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
