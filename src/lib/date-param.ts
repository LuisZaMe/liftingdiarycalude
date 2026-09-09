import { format, isValid, parse, startOfDay } from "date-fns";

/**
 * The `?date=` search param is a plain calendar day ("yyyy-MM-dd") with no time
 * and no zone. It is deliberately passed around as a string: a Date sent from a
 * Server Component to a Client Component is serialised to a UTC instant, so a
 * server-built local midnight is re-read in the browser's zone and can land on
 * the neighbouring day whenever the two differ.
 */
export const DATE_PARAM_FORMAT = "yyyy-MM-dd";

/** Formats a Date as a `?date=` param using its local calendar day. */
export function formatDateParam(date: Date): string {
  return format(date, DATE_PARAM_FORMAT);
}

/**
 * Parses a `?date=` param into local midnight, falling back to today when the
 * param is absent or not a real date.
 */
export function parseDateParam(dateString: string | undefined): Date {
  if (!dateString) return startOfDay(new Date());

  const parsed = parse(dateString, DATE_PARAM_FORMAT, new Date());
  return isValid(parsed) ? parsed : startOfDay(new Date());
}
