import { parseModel } from '../../models/helpers/model-versions.ts'
import type {
  ErasureCandidate,
  RetentionNoticeCandidate,
} from '../types/retention.ts'

export type RetentionNoticeRow = {
  userId: string
  email: string
  lastActivityAt: Date
  model: string | null
}

export type ErasureRow = {
  id: string
}

export const mapErasureCandidate = (row: ErasureRow): ErasureCandidate => ({
  userId: row.id,
})

export const mapRetentionNoticeCandidate = (
  row: RetentionNoticeRow
): RetentionNoticeCandidate => ({
  userId: row.userId,
  email: row.email,
  lastActivityAt: row.lastActivityAt,
  // Nothing stores the account's language: the language of its last simulation
  // is the closest thing to the one it reads the site in.
  locale: parseModel(row.model ?? '')?.locale ?? 'fr',
})
