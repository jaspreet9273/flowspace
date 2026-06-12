import Link from "next/link";
export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
      <p className="text-6xl font-bold text-slate-200 mb-4">404</p>
      <h1 className="text-2xl font-semibold text-slate-900 mb-2">Page not found</h1>
      <p className="text-slate-500 mb-6">The page you&apos;re looking for doesn&apos;t exist.</p>
      <Link href="/dashboard" className="text-indigo-600 hover:underline text-sm font-medium">
        ← Back to Dashboard
      </Link>
    </div>
  );
}
