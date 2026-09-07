import { Card, CardContent } from "@/components/ui/card";

export default function DashboardLoading() {
  return (
    <div className="container mx-auto max-w-4xl p-6">
      <h1 className="mb-8 text-3xl font-bold">Workout Dashboard</h1>
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">Loading workouts…</p>
        </CardContent>
      </Card>
    </div>
  );
}
