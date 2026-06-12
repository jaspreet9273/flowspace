// ============================================================
// AUTH LAYOUT — Route Group: (auth)
//
// LEARNING: Route groups use (parentheses) in the folder name.
// They group routes without affecting the URL path.
// /app/(auth)/login → URL: /login (not /auth/login)
//
// This layout wraps all auth pages with a centered card UI.
// ============================================================

import type { Metadata } from "next";
import { Zap } from "lucide-react";

export const metadata: Metadata = {
  title: {
    default: "Sign In",
    template: "%s | Flowspace",
  },
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col items-center justify-center px-4">
      {/* Logo */}
      <div className="mb-8 flex items-center gap-2.5">
        <div className="h-9 w-9 rounded-xl bg-indigo-600 flex items-center justify-center shadow-md">
          <Zap className="h-5 w-5 text-white" />
        </div>
        <span className="text-xl font-bold text-slate-900 tracking-tight">Flowspace</span>
      </div>

      {/* Card */}
      <div className="w-full max-w-[400px] bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
        {children}
      </div>

      {/* Footer */}
      <p className="mt-8 text-xs text-slate-400 text-center">
        By continuing, you agree to our{" "}
        <a href="#" className="underline hover:text-slate-600">Terms</a> and{" "}
        <a href="#" className="underline hover:text-slate-600">Privacy Policy</a>.
      </p>
    </div>
  );
}
