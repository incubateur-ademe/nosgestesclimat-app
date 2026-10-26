import { StatusCodes } from 'http-status-codes'
import type { ValueOf } from '../../types/types.ts'

export {
  AllNewsletters,
  Attributes,
  ListIds,
  TemplateIds,
  TRACKING_CAMPAIGNS,
  TRACKING_MEDIUM,
  TRACKING_SOURCE,
  type GroupTemplateId,
  type TemplateId,
} from '@nosgestesclimat/core/features/emails/email.constant'

export const ClientErrors = {
  BAD_REQUEST: {
    code: 'invalid_parameter',
    status: StatusCodes.BAD_REQUEST,
  },
  NOT_FOUND: {
    code: 'document_not_found',
    status: StatusCodes.NOT_FOUND,
  },
} as const

export type ClientErrors = ValueOf<typeof ClientErrors>
