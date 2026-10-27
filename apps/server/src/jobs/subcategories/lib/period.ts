/**
 * Période exportée : résolution des bornes à partir de `--period` ou de
 * `--start-date` / `--end-date`.
 *
 * `Simulation.date` est un `timestamp without time zone` : les bornes naïves
 * (`YYYY-MM-DD HH:MM:SS`) sont comparées directement, sans conversion de fuseau.
 */

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/
const PERIOD_RE = /^\d{4}-\d{2}$/

/** Vrai si la date `YYYY-MM-DD` existe réellement (rejette 2026-02-30). */
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
 * Résout la période exportée.
 *
 * - `--period YYYY-MM` couvre le mois entier (borne haute = 1er du mois suivant) ;
 * - `--end-date` est **incluse** : la borne haute est le lendemain à minuit ;
 * - sans `--end-date`, la période court jusqu'au début du mois suivant.
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
    throw new Error(`--period invalide : "${period}" (attendu YYYY-MM).`)
  }

  const startArg = startDate ?? (period ? `${period}-01` : null)
  if (startArg == null) {
    throw new Error('Indiquer --period YYYY-MM (ou --start-date).')
  }
  if (!isValidDateOnly(startArg)) {
    throw new Error(`--start-date invalide : "${startArg}".`)
  }

  let endExclusive: string
  if (endDate != null) {
    if (!isValidDateOnly(endDate)) {
      throw new Error(`--end-date invalide : "${endDate}".`)
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
