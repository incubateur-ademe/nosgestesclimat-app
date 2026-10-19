import type { ISOSupportedLanguage } from '../../geo/types/language.ts'

export type RetentionNoticeStage = 'retention-notice' | 'final-notice'

export type RetentionNoticeCandidate = {
  userId: string
  email: string
  lastActivityAt: Date
  locale: ISOSupportedLanguage
}
