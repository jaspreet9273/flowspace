// This loading.tsx wraps each page's Suspense boundary automatically.
// It shows while the async Server Component page.tsx is resolving.

export default function DashboardLoading() {
  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Header skeleton */}
      <div className="h-14 px-6 border-b border-slate-200 bg-white flex items-center justify-between shrink-0">
        <div className="h-4 w-40 rounded bg-slate-100 animate-pulse" />
        <div className="h-8 w-24 rounded-md bg-slate-100 animate-pulse" />
      </div>
      {/* Content skeleton */}
      <div className="flex-1 p-6 bg-slate-50">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 rounded-lg border border-slate-200 bg-white animate-pulse" />
          ))}
        </div>
        <div className="rounded-lg border border-slate-200 bg-white h-64 animate-pulse" />
      </div>
    </div>
  );
}
