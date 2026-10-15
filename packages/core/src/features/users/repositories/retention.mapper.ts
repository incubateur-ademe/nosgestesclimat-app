import { parseModelString } from '../../simulations/repository/model.mapper.ts'
import type {
  RetentionNoticeCandidate,
  RetentionNoticeStage,
} from '../types/retention.ts'

/** The row the sweep's queries return: an account, its last activity, and the
 * model of its last simulation. */
export type RetentionNoticeRow = {
  userId: string
  email: string
  lastActivityAt: Date
  model: string | null
}

/**
 * Maps a row of the sweep's queries, which keep only dated accounts and only
 * verified ones, one row each.
 */
export const mapRetentionNoticeCandidate = (
  row: RetentionNoticeRow
): RetentionNoticeCandidate => ({
  userId: row.userId,
  email: row.email,
  lastActivityAt: row.lastActivityAt,
  // Nothing stores the account's language: the language of its last simulation
  // is the closest thing to the one it reads the site in.
  locale: parseModelString(row.model ?? '')?.locale ?? 'fr',
})

/** The column a notice stamps, on the account it warned. */
export const mapNoticeStamp = ({
  stage,
  at,
}: Readonly<{ stage: RetentionNoticeStage; at: Date }>) =>
  stage === 'final-notice'
    ? { finalNoticeSentAt: at }
    : { retentionNoticeSentAt: at }
