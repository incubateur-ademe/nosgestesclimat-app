import { StatusCodes } from 'http-status-codes'
import { Locales } from '../../core/i18n/constant.js'
import type { ValueOf } from '../../types/types.js'

const FrTemplateIds = {
  SIMULATION_COMPLETED: 55,
  GROUP_CREATED: 57,
  GROUP_JOINED: 58,
  VERIFICATION_CODE: 66,
  ORGANISATION_CREATED: 70,
  ORGANISATION_JOINED: 122,
  POLL_CREATED: 126,
  SIMULATION_IN_PROGRESS: 102,
  API_VERIFICATION_CODE: 116,
  NEWSLETTER_CONFIRMATION: 118,
  SIGN_UP: 137,
  SIGN_UP_SIMULATION_COMPLETED: 138,
} as const

type FrTemplateIds = ValueOf<typeof FrTemplateIds>

const EnTemplateIds = {
  VERIFICATION_CODE: 125,
  ORGANISATION_CREATED: 124,
  ORGANISATION_JOINED: 123,
  POLL_CREATED: 127,
  SIGN_UP: 139,
  SIGN_UP_SIMULATION_COMPLETED: 140,
} as const

type EnTemplateIds = ValueOf<typeof EnTemplateIds>

export const TemplateIds = {
  [Locales.en]: EnTemplateIds,
  [Locales.fr]: FrTemplateIds,
} as const

export type TemplateIds = ValueOf<typeof TemplateIds>

export type TemplateId = FrTemplateIds | EnTemplateIds

export type GroupTemplateId =
  | typeof FrTemplateIds.GROUP_CREATED
  | typeof FrTemplateIds.GROUP_JOINED

export enum Attributes {
  NUMBER_CREATED_GROUPS_WITH_ONE_PARTICIPANT = 'NUMBER_CREATED_GROUPS_WITH_ONE_PARTICIPANT',
  LAST_SIMULATION_ALIMENTATION_FOOTPRINT = 'LAST_SIMULATION_ALIMENTATION_FOOTPRINT',
  LAST_SIMULATION_TRANSPORTS_FOOTPRINT = 'LAST_SIMULATION_TRANSPORTS_FOOTPRINT',
  LAST_SIMULATION_LOGEMENT_FOOTPRINT = 'LAST_SIMULATION_LOGEMENT_FOOTPRINT',
  LAST_SIMULATION_SERVICES_FOOTPRINT = 'LAST_SIMULATION_SERVICES_FOOTPRINT',
  LAST_SIMULATION_DIVERS_FOOTPRINT = 'LAST_SIMULATION_DIVERS_FOOTPRINT',
  LAST_SIMULATION_BILAN_FOOTPRINT = 'LAST_SIMULATION_BILAN_FOOTPRINT',
  LAST_POLL_PARTICIPANTS_NUMBER = 'LAST_POLL_PARTICIPANTS_NUMBER',
  LAST_SIMULATION_BILAN_WATER = 'LAST_SIMULATION_BILAN_WATER',
  LAST_GROUP_CREATION_DATE = 'LAST_GROUP_CREATION_DATE',
  ACTIONS_SELECTED_NUMBER = 'ACTIONS_SELECTED_NUMBER',
  IS_ORGANISATION_ADMIN = 'IS_ORGANISATION_ADMIN',
  NUMBER_CREATED_GROUPS = 'NUMBER_CREATED_GROUPS',
  LAST_SIMULATION_DATE = 'LAST_SIMULATION_DATE',
  ORGANISATION_NAME = 'ORGANISATION_NAME',
  ORGANISATION_SLUG = 'ORGANISATION_SLUG',
  USER_ID = 'USER_ID',
  PRENOM = 'PRENOM',
  OPT_IN = 'OPT_IN',
}

export const ListIds = {
  MAIN_NEWSLETTER: 22,
  ORGANISATIONS: 27,
  GROUP_CREATED: 29,
  GROUP_JOINED: 30,
  TRANSPORT_NEWSLETTER: 32,
  LOGEMENT_NEWSLETTER: 36,
  CONSO_NEWSLETTER: 40,
  ALIMENTATION_NEWSLETTER: 41,
  CITOYENS_NEWSLETTER: 42,
} as const

export type ListIds = ValueOf<typeof ListIds>

export const AllNewsletters = [
  ListIds.MAIN_NEWSLETTER,
  ListIds.LOGEMENT_NEWSLETTER,
  ListIds.TRANSPORT_NEWSLETTER,
  ListIds.CONSO_NEWSLETTER,
  ListIds.ALIMENTATION_NEWSLETTER,
  ListIds.CITOYENS_NEWSLETTER,
] as const

// Matomo campaigns & keywords
export const MATOMO_CAMPAIGN_KEY = 'mtm_campaign'
export const MATOMO_CAMPAIGN_EMAIL_AUTOMATISE = 'email-automatise'

export const MATOMO_KEYWORD_KEY = 'mtm_kwd'
export const MATOMO_KEYWORDS = {
  [TemplateIds[Locales.fr].SIMULATION_COMPLETED]: 'fin-retrouver-simulation',
  [TemplateIds[Locales.en].SIGN_UP_SIMULATION_COMPLETED]:
    'fin-retrouver-simulation',
  [TemplateIds[Locales.fr].SIGN_UP_SIMULATION_COMPLETED]:
    'fin-retrouver-simulation',
  [TemplateIds[Locales.fr].SIMULATION_IN_PROGRESS]: 'pause-test-en-cours',
  [TemplateIds[Locales.fr].GROUP_CREATED]: {
    GROUP_URL: 'groupe-admin-voir-classement',
    SHARE_URL: 'groupe-admin-url-partage',
    DELETE_URL: 'groupe-admin-delete',
  },
  [TemplateIds[Locales.fr].GROUP_JOINED]: {
    GROUP_URL: 'groupe-invite-voir-classement',
    SHARE_URL: 'groupe-invite-url-partage',
    DELETE_URL: 'groupe-invite-delete',
  },
  [TemplateIds[Locales.en].ORGANISATION_CREATED]: 'orga-admin-creation',
  [TemplateIds[Locales.fr].ORGANISATION_CREATED]: 'orga-admin-creation',
  [TemplateIds[Locales.en].ORGANISATION_JOINED]: 'orga-invite-campagne',
  [TemplateIds[Locales.fr].ORGANISATION_JOINED]: 'orga-invite-campagne',
  [TemplateIds[Locales.en].POLL_CREATED]: 'poll-admin-creation',
  [TemplateIds[Locales.fr].POLL_CREATED]: 'poll-admin-creation',
} as const

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
