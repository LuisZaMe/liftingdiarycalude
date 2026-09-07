import { db } from '@/db'
import { workouts, workoutExercises, exercises } from '@/db/schema'
import { eq, and, desc, gte, lte } from 'drizzle-orm'
import { auth } from '@clerk/nextjs/server'

export async function getUserWorkouts(date?: Date) {
  const { userId } = await auth()
  if (!userId) {
    throw new Error('Unauthorized')
  }

  const filters = [eq(workouts.userId, userId)]

  // Restrict to a single day when a date is supplied, filtering in the query
  // rather than over the returned rows.
  //
  // The bounds are built with Date.UTC rather than setHours so the same window
  // is produced regardless of the server's TZ. started_at is a `timestamp`
  // (no time zone) and the driver serialises Dates to UTC on the way into the
  // query, so a locally-built midnight would shift the window by the server's
  // UTC offset and bin workouts under the neighbouring day.
  if (date) {
    const startOfDay = new Date(
      Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
    )

    const endOfDay = new Date(
      Date.UTC(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        23,
        59,
        59,
        999
      )
    )

    filters.push(
      gte(workouts.startedAt, startOfDay),
      lte(workouts.startedAt, endOfDay)
    )
  }

  return await db
    .select({
      id: workouts.id,
      name: workouts.name,
      startedAt: workouts.startedAt,
      completedAt: workouts.completedAt,
      createdAt: workouts.createdAt,
    })
    .from(workouts)
    .where(and(...filters))
    .orderBy(desc(workouts.startedAt))
}

export async function getUserWorkoutWithExercises(workoutId: string) {
  const { userId } = await auth()
  if (!userId) {
    throw new Error('Unauthorized')
  }

  const result = await db
    .select({
      workout: {
        id: workouts.id,
        name: workouts.name,
        startedAt: workouts.startedAt,
        completedAt: workouts.completedAt,
        userId: workouts.userId,
      },
      exercise: {
        id: exercises.id,
        name: exercises.name,
      },
      workoutExercise: {
        id: workoutExercises.id,
        order: workoutExercises.order,
      },
    })
    .from(workouts)
    .leftJoin(workoutExercises, eq(workouts.id, workoutExercises.workoutId))
    .leftJoin(exercises, eq(workoutExercises.exerciseId, exercises.id))
    .where(and(eq(workouts.id, workoutId), eq(workouts.userId, userId)))
    .orderBy(workoutExercises.order)

  if (result.length === 0) {
    return null
  }

  const workout = result[0].workout
  const exercisesList = result
    .filter(row => row.exercise?.id)
    .map(row => row.exercise!.name)

  return {
    ...workout,
    exercises: exercisesList,
  }
}
