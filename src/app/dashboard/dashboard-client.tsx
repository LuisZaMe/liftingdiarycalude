"use client";

import { format } from "date-fns";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CalendarClient } from "./calendar-client";
import { parseDateParam } from "@/lib/date-param";

interface DashboardWorkout {
  id: string;
  name: string;
  startedAt: Date;
  completedAt: Date | null;
}

interface DashboardClientProps {
  workouts: DashboardWorkout[];
  /** The selected calendar day as "yyyy-MM-dd" — see @/lib/date-param. */
  selectedDate: string;
}

export function DashboardClient({
  workouts,
  selectedDate,
}: DashboardClientProps) {
  const selected = parseDateParam(selectedDate);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold">
            Workouts for {format(selected, "do MMM yyyy")}
          </h2>
          <p className="text-sm text-muted-foreground">
            {workouts.length === 1
              ? "1 workout logged"
              : `${workouts.length} workouts logged`}
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <CalendarClient selectedDate={selectedDate} />
          <Button render={<Link href="/dashboard/workout/new" />}>
            Log New Workout
          </Button>
        </div>
      </div>

      {workouts.length > 0 ? (
        <div className="space-y-4">
          {workouts.map((workout) => (
            <Card key={workout.id}>
              <CardHeader>
                <CardTitle>{workout.name}</CardTitle>
                <CardDescription>
                  Started at {format(workout.startedAt, "h:mm a")}
                </CardDescription>
                <CardAction>
                  <Button
                    variant="outline"
                    size="sm"
                    render={<Link href={`/dashboard/workout/${workout.id}`} />}
                  >
                    View
                  </Button>
                </CardAction>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {workout.completedAt
                    ? `Completed • ${Math.round(
                        (workout.completedAt.getTime() -
                          workout.startedAt.getTime()) /
                          (1000 * 60)
                      )} min`
                    : "In progress"}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              No workouts logged for {format(selected, "do MMM yyyy")}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
