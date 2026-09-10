import { ListIds } from '@nosgestesclimat/core/features/emails/email.constant'
import { StatusCodes } from 'http-status-codes'
import type { ValueOf } from '../../types/types.ts'

export {
  Attributes,
  ListIds,
  TemplateIds,
  TRACKING_CAMPAIGNS,
  TRACKING_MEDIUM,
  TRACKING_SOURCE,
  type GroupTemplateId,
  type TemplateId,
} from '@nosgestesclimat/core/features/emails/email.constant'

export const AllNewsletters = [
  ListIds.MAIN_NEWSLETTER,
  ListIds.LOGEMENT_NEWSLETTER,
  ListIds.TRANSPORT_NEWSLETTER,
  ListIds.CONSO_NEWSLETTER,
  ListIds.ALIMENTATION_NEWSLETTER,
  ListIds.CITOYENS_NEWSLETTER,
] as const

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
