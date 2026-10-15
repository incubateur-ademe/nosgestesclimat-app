import { shiftMonths } from '../../../lib/date.ts'

/** Inactivity that ends in erasure. */
const RETENTION_PERIOD_MONTHS = 24
/** How long before that instant each notice lands. */
const RETENTION_NOTICE_LEAD_MONTHS = 3
const FINAL_NOTICE_LEAD_DAYS = 7
const DAY_MS = 24 * 60 * 60 * 1000

/** An account active before this instant has missed its last notice window. */
export const retentionNoticeActivityBefore = (now: Date) =>
  shiftMonths({
    date: now,
    months: -(RETENTION_PERIOD_MONTHS - RETENTION_NOTICE_LEAD_MONTHS),
  })

/** An account active before this instant is within a week of erasure. */
export const finalNoticeActivityBefore = (now: Date) =>
  new Date(
    shiftMonths({ date: now, months: -RETENTION_PERIOD_MONTHS }).getTime() +
      FINAL_NOTICE_LEAD_DAYS * DAY_MS
  )

/** The instant the account is erased, which the notice announces. */
export const erasureDate = (lastActivityAt: Date) =>
  shiftMonths({ date: lastActivityAt, months: RETENTION_PERIOD_MONTHS })
