import { Suspense } from "react";
import { getUserWorkouts } from "@/data/user-workouts";
import { Card, CardContent } from "@/components/ui/card";
import { DashboardClient } from "./dashboard-client";
import { formatDateParam, parseDateParam } from "@/lib/date-param";

interface DashboardPageProps {
  searchParams: Promise<{ date?: string }>;
}

export default async function DashboardPage({
  searchParams,
}: DashboardPageProps) {
  const { date } = await searchParams;

  return (
    <div className="container mx-auto max-w-4xl p-6">
      <h1 className="mb-8 text-3xl font-bold">Workout Dashboard</h1>
      {/* Keyed on the date param so a search-param-only navigation remounts the
          subtree instead of reconciling it against the previous day's data. */}
      <Suspense
        key={date ?? "today"}
        fallback={
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">Loading workouts…</p>
            </CardContent>
          </Card>
        }
      >
        <DashboardWorkouts date={date} />
      </Suspense>
    </div>
  );
}

async function DashboardWorkouts({ date }: { date: string | undefined }) {
  const selectedDate = parseDateParam(date);
  const workouts = await getUserWorkouts(selectedDate);

  // The day is handed down as a string, not a Date: React serialises a Date to
  // a UTC instant across the RSC boundary, which shifts the calendar day for
  // any browser whose offset differs from the server's.
  return (
    <DashboardClient
      workouts={workouts}
      selectedDate={formatDateParam(selectedDate)}
    />
  );
}
