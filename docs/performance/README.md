# Performance Optimization in Next.js

> **Implementation**: `src/components/`, `next.config.ts`  
> **Interview relevance**: ⭐⭐⭐⭐

---

## 1. Dynamic Imports & Code Splitting

```tsx
import dynamic from "next/dynamic";

// ❌ Imports the entire recharts library upfront
import { LineChart } from "recharts";

// ✅ Only loads recharts when AnalyticsChart is rendered
const AnalyticsChart = dynamic(() => import("@/components/analytics/charts"), {
  loading: () => <ChartSkeleton />, // Shown while loading
  ssr: false, // Charts use browser APIs — skip SSR
});

// Usage — only loads recharts JS when this component renders
function AnalyticsPage() {
  return <AnalyticsChart data={data} />;
}
```

**When to use `ssr: false`**:

- Components using `window`, `document`, `navigator`
- Browser-only libraries (WebGL, canvas, audio)
- Components that cause hydration mismatches

---

## 2. Image Optimization

```tsx
import Image from "next/image";

// ❌ Regular img — no optimization
<img src="/hero.jpg" alt="Hero" />

// ✅ next/image — automatic:
// - WebP/AVIF conversion
// - Responsive srcsets
// - Lazy loading
// - Prevents Cumulative Layout Shift (CLS)
<Image
  src="/hero.jpg"
  alt="Hero image"
  width={1200}
  height={600}
  priority  // LCP image — loads eagerly, not lazily
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,..."
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
/>
```

**Priority images**: Use `priority` on your Largest Contentful Paint element (typically the hero image above the fold). This removes the lazy loading and adds a `<link rel="preload">`.

---

## 3. Font Optimization

```tsx
// src/app/layout.tsx
import { Inter, Fira_Code } from "next/font/google";

// Next.js downloads, self-hosts, and subsets the font at BUILD TIME.
// - Zero CLS (font-display: optional or swap)
// - No external network request at runtime
// - Automatic subsetting (only characters you use)
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap", // Text shows immediately with fallback font
});

const firaCode = Fira_Code({
  subsets: ["latin"],
  variable: "--font-fira-code",
  display: "swap",
});

export default function Layout({ children }) {
  return (
    <html className={`${inter.variable} ${firaCode.variable}`}>
      <body className="font-sans">{children}</body>
    </html>
  );
}
```

---

## 4. Bundle Analysis

```bash
# Install bundle analyzer
npm install @next/bundle-analyzer

# next.config.ts
import bundleAnalyzer from "@next/bundle-analyzer";
const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});
export default withBundleAnalyzer(nextConfig);

# Run analysis
ANALYZE=true npm run build
```

**What to look for**:

- Large node_modules (moment.js → date-fns, lodash → lodash-es)
- Duplicate packages (two versions of React)
- Server code in client bundles

---

## 5. Lazy Loading Heavy Components

```tsx
"use client";
import { useState, Suspense, lazy } from "react";

// Heavy editor — only load when user actually clicks "Edit"
const RichTextEditor = lazy(() => import("@/components/editor"));

function TaskDescription({ description }) {
  const [editing, setEditing] = useState(false);

  return (
    <div>
      {editing ? (
        <Suspense fallback={<div>Loading editor...</div>}>
          <RichTextEditor value={description} />
        </Suspense>
      ) : (
        <p onClick={() => setEditing(true)}>{description}</p>
      )}
    </div>
  );
}
```

---

## 6. Optimizing TanStack Query

```typescript
// ✅ Set appropriate staleTime to prevent unnecessary refetches
useQuery({
  queryKey: ["users"],
  queryFn: fetchUsers,
  staleTime: 10 * 60 * 1000,    // User list is stable — 10 min
});

useQuery({
  queryKey: ["notifications"],
  queryFn: fetchNotifications,
  staleTime: 30 * 1000,          // Notifications — 30 sec
  refetchInterval: 30 * 1000,    // Poll every 30 sec
});

// ✅ Prefetch on hover for instant navigation feel
function ProjectLink({ id }) {
  const queryClient = useQueryClient();
  return (
    <Link
      href={`/projects/${id}`}
      onMouseEnter={() => {
        queryClient.prefetchQuery({
          queryKey: ["projects", id],
          queryFn: () => projectsApi.get(id),
          staleTime: 30_000,
        });
      }}
    >
      View Project
    </Link>
  );
}
```

---

## 7. Turbopack (Next.js 14+)

```bash
# next.config.ts — enable Turbopack for dev
# (it's now the default in Next 16)
# package.json dev script:
"dev": "next dev --turbopack"
```

Turbopack replaces Webpack for development builds:

- 10x faster cold starts
- ~700ms HMR vs seconds with Webpack
- Incremental compilation (only recompiles changed modules)

---

## 8. Core Web Vitals Checklist

### LCP (Largest Contentful Paint) — target < 2.5s

- Add `priority` to above-fold images
- Use `next/image` for automatic optimization
- Preload critical fonts
- Use streaming to send HTML faster

### CLS (Cumulative Layout Shift) — target < 0.1

- Always set `width` and `height` on images (or use `fill` layout)
- Avoid inserting content above existing content
- Use `font-display: swap` or `optional` (Next.js handles this)

### FID/INP (Interaction to Next Paint) — target < 200ms

- Code-split heavy components with `dynamic()`
- Move heavy computation to Web Workers
- Use `useTransition` for non-urgent state updates
- Avoid long tasks in the main thread

---

## Interview Notes

**Q: How does Next.js handle code splitting?**

> Automatically per route — each page gets its own JS chunk, only loaded when navigated to. Additionally: dynamic imports for manual splitting, RSC means server code never ships to browser, and `next/dynamic` for lazy Client Components.

**Q: What's the difference between `priority` and lazy loading on `next/image`?**

> By default, `next/image` lazy loads all images (only fetches when near viewport). Adding `priority` disables lazy loading and injects a `<link rel="preload">` in the `<head>`, telling the browser to fetch it as soon as possible. Use `priority` on your LCP image.

**Q: Why use `next/font` instead of a `<link>` tag for Google Fonts?**

> `<link>` fonts require a network request at runtime — slow, flash of unstyled text (FOUT). `next/font` downloads fonts at build time, self-hosts them (no external request, no privacy leak), generates optimal `@font-face` CSS, and eliminates CLS by using `size-adjust`.
