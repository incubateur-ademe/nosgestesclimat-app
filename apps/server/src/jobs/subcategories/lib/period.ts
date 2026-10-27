/**
 * Exported period: resolves bounds from `--period` or `--start-date` /
 * `--end-date`.
 *
 * `Simulation.date` is a `timestamp without time zone`: naive bounds
 * (`YYYY-MM-DD HH:MM:SS`) are compared as-is, with no timezone conversion.
 */

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/
const PERIOD_RE = /^\d{4}-\d{2}$/

/** True if the `YYYY-MM-DD` date really exists (rejects 2026-02-30). */
export const isValidDateOnly = (value: string): boolean => {
  if (!DATE_RE.test(value)) return false
  const [y, m, d] = value.split('-').map(Number)
  const date = new Date(Date.UTC(y, m - 1, d))
  return (
    date.getUTCFullYear() === y &&
    date.getUTCMonth() === m - 1 &&
    date.getUTCDate() === d
  )
}

export type Period = { period: string; startDate: string; endDate: string }

/**
 * Resolves the exported period.
 *
 * - `--period YYYY-MM` covers the whole month (upper bound = first day of the
 *   next month);
 * - `--end-date` is **inclusive**: the upper bound is the next midnight;
 * - without `--end-date`, the period runs until the first day of the next month.
 */
export const resolvePeriod = ({
  period,
  startDate,
  endDate,
}: {
  period?: string | null
  startDate?: string | null
  endDate?: string | null
}): Period => {
  if (period != null && !PERIOD_RE.test(period)) {
    throw new Error(`invalid --period: "${period}" (expected YYYY-MM).`)
  }

  const startArg = startDate ?? (period ? `${period}-01` : null)
  if (startArg == null) {
    throw new Error('missing --period YYYY-MM (or --start-date).')
  }
  if (!isValidDateOnly(startArg)) {
    throw new Error(`invalid --start-date: "${startArg}".`)
  }

  let endExclusive: string
  if (endDate != null) {
    if (!isValidDateOnly(endDate)) {
      throw new Error(`invalid --end-date: "${endDate}".`)
    }
    const next = new Date(`${endDate}T00:00:00Z`)
    next.setUTCDate(next.getUTCDate() + 1)
    endExclusive = next.toISOString().slice(0, 10)
  } else {
    const [year, month] = startArg.split('-').map(Number)
    endExclusive = new Date(Date.UTC(year, month, 1)).toISOString().slice(0, 10)
  }

  return {
    period: period ?? startArg.slice(0, 7),
    startDate: `${startArg} 00:00:00`,
    endDate: `${endExclusive} 00:00:00`,
  }
}
