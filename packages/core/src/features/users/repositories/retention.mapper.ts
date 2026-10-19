import { parseModelString } from '../../simulations/repository/model.mapper.ts'
import type {
  RetentionNoticeCandidate,
  RetentionNoticeStage,
} from '../types/retention.ts'

export type RetentionNoticeRow = {
  userId: string
  email: string
  lastActivityAt: Date
  model: string | null
}

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

export const mapNoticeStamp = ({
  stage,
  at,
}: Readonly<{ stage: RetentionNoticeStage; at: Date }>) =>
  stage === 'final-notice'
    ? { finalNoticeSentAt: at }
    : { retentionNoticeSentAt: at }
