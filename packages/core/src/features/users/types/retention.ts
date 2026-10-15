import type { ISOSupportedLanguage } from '../../geo/types/language.ts'

/**
 * The two notices a verified account receives before erasure. Each value names
 * a notice, so one read on its own — in a log line, in the column it maps to —
 * does not leave the reader guessing which half of the pair it is.
 */
export type RetentionNoticeStage = 'retention-notice' | 'final-notice'

/** An account a notice is due to. The notice it is owed is the window the query
 * that found it covers. */
export type RetentionNoticeCandidate = {
  userId: string
  email: string
  lastActivityAt: Date
  locale: ISOSupportedLanguage
}
