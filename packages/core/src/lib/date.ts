/**
 * Moves a date by whole calendar months. The day is clamped to the target
 * month, so three months before 31 May is the end of February, not 3 March.
 */
export const shiftDateByNumberOfMonths = ({
  date,
  months,
}: Readonly<{ date: Date; months: number }>): Date => {
  const shifted = new Date(date)
  const targetMonth = shifted.getUTCMonth() + months
  // Day 0 of the month after the target is the target's last day.
  const lastDay = new Date(
    Date.UTC(shifted.getUTCFullYear(), targetMonth + 1, 0)
  ).getUTCDate()

  shifted.setUTCDate(Math.min(shifted.getUTCDate(), lastDay))
  shifted.setUTCMonth(targetMonth)

  return shifted
}
