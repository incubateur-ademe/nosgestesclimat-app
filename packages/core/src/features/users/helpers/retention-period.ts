import { shiftDateByNumberOfMonths } from '../../../lib/date.ts'

/** Inactivity that ends in erasure. */
const RETENTION_PERIOD_MONTHS = 24
/** How long before that instant each notice lands. */
const RETENTION_NOTICE_LEAD_MONTHS = 3
const FINAL_NOTICE_LEAD_DAYS = 7
const DAY_MS = 24 * 60 * 60 * 1000

/** An account last active before this instant is due the retention notice. */
export const retentionNoticeActivityDateCutoff = (now: Date) =>
  shiftDateByNumberOfMonths({
    date: now,
    months: -(RETENTION_PERIOD_MONTHS - RETENTION_NOTICE_LEAD_MONTHS),
  })

/** An account last active before this instant is due the final notice. */
export const finalNoticeActivityDateCutoff = (now: Date) =>
  new Date(
    shiftDateByNumberOfMonths({
      date: now,
      months: -RETENTION_PERIOD_MONTHS,
    }).getTime() +
      FINAL_NOTICE_LEAD_DAYS * DAY_MS
  )

/** When the account is erased, if it stays idle. */
export const erasureDate = (lastActivityAt: Date) =>
  shiftDateByNumberOfMonths({
    date: lastActivityAt,
    months: RETENTION_PERIOD_MONTHS,
  })
