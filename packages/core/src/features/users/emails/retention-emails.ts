import { TemplateIds } from '../../emails/email.constant.ts'
import type { Email } from '../../emails/types.ts'
import type { ISOSupportedLanguage } from '../../geo/types/language.ts'
import type { RetentionNoticeStage } from '../types/retention.ts'

const MS_PER_DAY = 24 * 60 * 60 * 1000

const STAGE_TEMPLATES = {
  'retention-notice': 'RETENTION_NOTICE',
  'final-notice': 'FINAL_RETENTION_NOTICE',
} as const satisfies Record<
  RetentionNoticeStage,
  keyof (typeof TemplateIds)['fr']
>

export const createRetentionNoticeEmail = ({
  locale,
  email,
  stage,
  deletionAt,
}: Readonly<{
  locale: ISOSupportedLanguage
  email: string
  stage: RetentionNoticeStage
  deletionAt: Date
}>): Email => ({
  email,
  // Every supported language carries both notices.
  templateId: TemplateIds[locale][STAGE_TEMPLATES[stage]],
  // The account has no time zone: the erasure falls on the UTC day of
  // `deletionAt` or on either side of it in the user's calendar, so the notice
  // names the earliest of the three.
  params: {
    DELETION_DATE: new Date(
      deletionAt.getTime() - MS_PER_DAY
    ).toLocaleDateString(locale, {
      timeZone: 'UTC',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }),
  },
})
