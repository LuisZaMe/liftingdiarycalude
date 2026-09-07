# Data Fetching Standards

This document is the source of truth for **reading** data in this application. For writes, see
[`data-mutations.md`](./data-mutations.md). For auth primitives, see [`auth.md`](./auth.md).

## 1. Server Components Only

**ALL data fetching in this app MUST happen in Server Components.** This is non-negotiable and
applies to every page, every feature, and every "small" change.

### ✅ The only approved method

- `async` Server Components (pages, layouts, and non-`"use client"` components) that `await` a
  helper from `@/data`.

### ❌ Prohibited — never fetch data this way

- **Route handlers** (`app/**/route.ts`) used as a data API for your own UI.
- **Client Components** — anything under a `"use client"` boundary.
- **Client-side fetching** — `fetch` in `useEffect`, SWR, React Query, axios, tRPC clients, etc.
- **Direct `db` access from a component** — even in a Server Component. Queries live in `@/data`.
- Any other mechanism not listed as approved above.

### Getting data into Client Components

Client Components never fetch. Fetch on the server and pass the result down as props:

```tsx
// src/app/dashboard/page.tsx  (Server Component — no "use client")
import { getUserWorkouts } from "@/data/user-workouts";
import { DashboardClient } from "./dashboard-client";

export default async function DashboardPage() {
  const workouts = await getUserWorkouts();
  return <DashboardClient workouts={workouts} />;
}
```

```tsx
// src/app/dashboard/dashboard-client.tsx
"use client";

// Receives data as props. It does NOT fetch.
export function DashboardClient({ workouts }: { workouts: Workout[] }) {
  // interactivity only
}
```

If a Client Component needs fresh data after an interaction, that is a **mutation + revalidation**
concern — use a Server Action and `revalidatePath`. See `data-mutations.md`. Do not reach for a
route handler.

## 2. All Queries Live in `/src/data`

Every database query MUST be a helper function in the `src/data` directory. Components import
helpers; they never import `db` or the schema directly.

- One file per domain concept: `user-workouts.ts`, `workouts.ts`, `exercises.ts`, `sets.ts`.
- Helpers are plain `async` functions exported by name.
- Nothing outside `src/data` may import from `@/db`.

## 3. Drizzle ORM — No Raw SQL

- **MUST** use the Drizzle query builder (`db.select()`, `db.insert()`, …) with the typed schema
  from `@/db/schema`.
- **NEVER** write raw SQL. No `db.execute(sql\`…\`)`, no template-literal queries, no string
  concatenation of query text.
- Build predicates with Drizzle operators (`eq`, `and`, `desc`, …) imported from `drizzle-orm`.

```ts
import { db } from "@/db";
import { workouts } from "@/db/schema";
import { and, eq, desc } from "drizzle-orm";
```

## 4. 🔒 Users May Only Ever Access Their Own Data

**This is the most important rule in this document.** A signed-in user must be able to read their
own rows and *nothing else*. A missing ownership filter is a data breach, not a bug.

Every helper that touches user-owned data MUST:

1. **Resolve the user on the server** via Clerk's `auth()` — never accept a user id from the
   client, a prop, a search param, or a form field.
2. **Throw when unauthenticated.**
3. **Filter by `userId` inside the query itself** — in the `where` clause, not by filtering the
   results in JavaScript afterwards.
4. **Scope by ownership on lookups by id**, so an attacker guessing another user's row id gets
   nothing back.

```ts
// src/data/user-workouts.ts
import { db } from "@/db";
import { workouts } from "@/db/schema";
import { and, eq, desc } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";

export async function getUserWorkouts() {
  const { userId } = await auth();          // 1. server-derived identity
  if (!userId) throw new Error("Unauthorized"); // 2. reject anonymous callers

  return db
    .select()
    .from(workouts)
    .where(eq(workouts.userId, userId))     // 3. ownership filter in the query
    .orderBy(desc(workouts.startedAt));
}

export async function getUserWorkout(workoutId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const [workout] = await db
    .select()
    .from(workouts)
    // 4. id AND owner — never `eq(workouts.id, workoutId)` alone
    .where(and(eq(workouts.id, workoutId), eq(workouts.userId, userId)));

  return workout ?? null;
}
```

### Child records inherit ownership through a join

`workoutExercises` and `sets` have no `userId` column. Ownership therefore MUST be enforced by
joining back up to `workouts` and filtering on `workouts.userId` in the same query. Never query a
child table by a client-supplied id on its own.

```ts
// ✅ ownership enforced through the parent workout
export async function getWorkoutSets(workoutId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  return db
    .select({ id: sets.id, setNumber: sets.setNumber, weight: sets.weight, reps: sets.reps })
    .from(sets)
    .innerJoin(workoutExercises, eq(sets.workoutExerciseId, workoutExercises.id))
    .innerJoin(workouts, eq(workoutExercises.workoutId, workouts.id))
    .where(and(eq(workouts.id, workoutId), eq(workouts.userId, userId)));
}
```

```ts
// ❌ NEVER — any user can pass any workoutId and read someone else's training log
export async function getWorkoutSets(workoutId: string) {
  return db.select().from(sets).where(eq(sets.workoutExerciseId, workoutId));
}
```

### Anti-patterns to reject in review

```ts
// ❌ user id supplied by the caller — the client can pass anyone's id
export async function getWorkouts(userId: string) { … }

// ❌ filtering after the fact — the rows already left the database
const all = await db.select().from(workouts);
return all.filter((w) => w.userId === userId);

// ❌ raw SQL, and trivially injectable
await db.execute(sql`select * from workouts where user_id = ${userId}`);
```

### Shared reference data

`exercises` is a global catalogue with no owner, so it needs no `userId` filter. It is the sole
exception, and it must stay read-only from the app's perspective. Any table carrying a `userId` —
directly or through a parent — always gets the ownership filter.

## 5. Checklist Before Merging a Data Change

- [ ] The fetch happens in a Server Component, not a client component or route handler.
- [ ] The query lives in `src/data/*`; no component imports `@/db`.
- [ ] Drizzle query builder only — no raw SQL anywhere.
- [ ] `auth()` is called inside the helper and throws when there is no `userId`.
- [ ] No helper accepts a user id as a parameter.
- [ ] Every user-owned table is filtered by `userId` in the `where` clause, child tables via a join
      to `workouts`.
- [ ] Lookups by id filter on id **and** owner.

## Why This Approach

1. **Security** — identity is derived on the server and ownership is enforced in one auditable place.
2. **Performance** — no client/server fetch waterfalls; queries run next to the database.
3. **Type safety** — Drizzle infers result types end to end from the schema.
4. **Consistency** — one predictable place to look for, and review, every query.
