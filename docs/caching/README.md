# Caching in Next.js App Router

> **Interview relevance**: ⭐⭐⭐⭐⭐ — frequently asked and often misunderstood  
> **Key insight**: Next.js has FOUR separate caches that operate independently

---

## The Four Caches

```
┌─────────────────────────────────────────────────────────┐
│                    Request comes in                      │
│                          │                              │
│                    ┌─────▼──────┐                       │
│              1.    │Router Cache│  (browser memory)      │
│                    └─────┬──────┘                       │
│                          │ miss                         │
│                    ┌─────▼──────────┐                   │
│              2.    │Full Route Cache│  (disk, server)    │
│                    └─────┬──────────┘                   │
│                          │ miss                         │
│                    ┌─────▼──────┐                       │
│              3.    │ Data Cache │  (persistent, server)  │
│                    └─────┬──────┘                       │
│                          │ miss                         │
│                    ┌─────▼────────────┐                 │
│              4.    │Request Memoization│  (per-request)  │
│                    └──────────────────┘                 │
└─────────────────────────────────────────────────────────┘
```

---

## 1. Request Memoization (Per-Request)

**Scope**: Single server request  
**Duration**: Until request completes  
**What**: Deduplicates identical `fetch()` calls in the same render tree

```tsx
// These two Server Components fetch the same URL:
async function HeaderUserInfo() {
  const user = await fetch("/api/me"); // Fetch #1
  return <span>{user.name}</span>;
}

async function SidebarAvatar() {
  const user = await fetch("/api/me"); // NOT fetched again — memoized!
  return <Avatar src={user.avatar} />;
}

// Only ONE actual HTTP request is made, even though two
// components independently called fetch("/api/me")
```

**Only works for**: `fetch()` calls with same URL and options. Does NOT memoize database calls — use React's `cache()` for that.

```typescript
import { cache } from "react";

// Wrap DB queries with cache() for request memoization
export const getUser = cache(async (userId: string) => {
  return await db.user.findUnique({ where: { id: userId } });
});

// Now multiple Server Components calling getUser(id) in the same
// request only hit the DB once
```

---

## 2. Data Cache (Persistent)

**Scope**: Across requests, across deployments  
**Duration**: Until revalidated  
**What**: Caches `fetch()` responses on disk

```typescript
// Cache forever (until manual revalidation)
const data = await fetch(url, { cache: "force-cache" });

// Never cache (always fresh — SSR behaviour)
const data = await fetch(url, { cache: "no-store" });

// Cache with time-based revalidation (ISR behaviour)
const data = await fetch(url, {
  next: { revalidate: 3600 }, // revalidate after 1 hour
});

// Cache with tag for on-demand revalidation
const data = await fetch(url, {
  next: { tags: ["tasks", "user-123"] },
});
```

### On-demand revalidation

```typescript
// In a Server Action or Route Handler, after a mutation:
import { revalidateTag, revalidatePath } from "next/cache";

export async function createTask(data) {
  await db.task.create({ data });
  
  revalidateTag("tasks");        // Invalidates all fetches tagged "tasks"
  revalidatePath("/dashboard");  // Invalidates the /dashboard page cache
}
```

---

## 3. Full Route Cache (Static Pages)

**Scope**: Server disk  
**Duration**: Until revalidation or new deployment  
**What**: Caches the entire rendered HTML + RSC payload for static routes

```typescript
// Page is fully static — rendered once at build time
export default async function StaticPage() {
  const posts = await fetch(url, { next: { revalidate: 86400 } });
  return <Posts posts={posts} />;
}

// Opt OUT of full route cache (page renders on each request):
export const dynamic = "force-dynamic";

// Or use dynamic functions that auto-opt-out:
import { cookies, headers } from "next/headers";
export default async function Page() {
  const session = (await cookies()).get("session"); // Auto opts out of full route cache
  return <Dashboard />;
}
```

### What opts out of the Full Route Cache automatically?
- `cookies()` — reading cookies
- `headers()` — reading request headers
- `searchParams` prop — reading query string
- `cache: "no-store"` fetch option
- `export const dynamic = "force-dynamic"`

---

## 4. Router Cache (Client-Side)

**Scope**: Browser memory (per tab)  
**Duration**: 30 seconds (dynamic) or 5 minutes (static), cleared on full navigation  
**What**: Caches RSC payloads in the browser so navigating back is instant

```
User visits /dashboard → RSC payload cached
User goes to /tasks    → Navigates away
User clicks Back       → /dashboard loaded from Router Cache (instant!)
```

**Invalidating Router Cache**:
```typescript
import { useRouter } from "next/navigation";

const router = useRouter();
router.refresh(); // Clears Router Cache for current route, refetches from server

// Or invalidate from Server Actions with:
revalidatePath("/dashboard"); // Also clears router cache for that path
```

---

## Caching Configuration Summary

```typescript
// Page-level cache configuration
export const dynamic = "auto";          // Default: cache if possible
export const dynamic = "force-dynamic"; // Never cache (per-request)
export const dynamic = "force-static";  // Always cache (build time)
export const dynamic = "error";         // Error if dynamic data used

export const revalidate = 0;     // Never cache (same as force-dynamic)
export const revalidate = 60;    // Revalidate every 60 seconds (ISR)
export const revalidate = false; // Cache forever

// Fetch-level cache configuration (overrides page config)
fetch(url, { cache: "no-store" });         // Never cache
fetch(url, { cache: "force-cache" });      // Cache forever
fetch(url, { next: { revalidate: 60 } }); // ISR: 60 seconds
fetch(url, { next: { tags: ["posts"] } }); // Tag for invalidation
```

---

## Practical Caching Patterns

### Pattern 1: Dashboard (Always fresh)
```typescript
export const dynamic = "force-dynamic";
// or
export const revalidate = 0;
```

### Pattern 2: Product catalog (ISR)
```typescript
export const revalidate = 3600; // Refresh hourly
```

### Pattern 3: Blog posts (On-demand ISR)
```typescript
// fetch with tag
const post = await fetch(url, { next: { tags: [`post-${id}`] } });

// In webhook handler (when CMS publishes):
revalidateTag(`post-${id}`);
```

### Pattern 4: Public + Private mix (PPR)
```typescript
// Static shell + dynamic user data
export default function Page() {
  return (
    <StaticShell>         {/* Cached at build time */}
      <Suspense>
        <UserDashboard /> {/* Dynamic, streamed */}
      </Suspense>
    </StaticShell>
  );
}
```

---

## Common Caching Mistakes

1. **Not setting `no-store` for user-specific data**: User A's data gets cached and served to User B. Always use `cache: "no-store"` or dynamic cookies/headers for authenticated content.

2. **Over-caching mutable data**: Setting a long `revalidate` on data that changes frequently leads to users seeing stale state.

3. **Forgetting to revalidate after mutations**: Creating a task in a Server Action but not calling `revalidatePath` means the task list shows stale data.

4. **Confusing the four caches**: Router Cache is client-side; Data Cache is server-side. `router.refresh()` clears router cache; `revalidateTag` clears data cache.

---

## Interview Notes

**Q: Explain the difference between the Data Cache and the Router Cache.**
> The Data Cache is server-side and persistent across requests — it caches `fetch()` responses on disk. The Router Cache is client-side (browser memory) and caches RSC payloads from navigations within the current tab session. They're completely separate systems.

**Q: How does ISR work at the cache level?**
> On first request, the page renders and is stored in the Full Route Cache. Subsequent requests are served from cache instantly. After `revalidate` seconds, the next request triggers a background regeneration — the old page is served while the new one generates (stale-while-revalidate). This means users always get fast responses.

**Q: When would you use `revalidateTag` over `revalidatePath`?**
> `revalidatePath` revalidates all data for a specific URL. `revalidateTag` is more surgical — it revalidates all fetches with that tag regardless of which page they're on. Use tags when the same data is shown on multiple pages (e.g., a user's avatar shown on dashboard, profile, and settings pages — tag it "user-avatar").
