import { TemplateIds } from '../../emails/email.constant.ts'
import type { Email } from '../../emails/types.ts'
import type { ISOSupportedLanguage } from '../../geo/types/language.ts'
import type { RetentionNoticeStage } from '../types/retention.ts'

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
  // Every supported language carries both notices: that the lookup indexes
  // through `TemplateIds` is what holds it, not a check at runtime.
  templateId: TemplateIds[locale][STAGE_TEMPLATES[stage]],
  // The reconnect link is built into the template itself.
  params: { DELETION_DATE: deletionAt.toISOString().slice(0, 10) },
})
