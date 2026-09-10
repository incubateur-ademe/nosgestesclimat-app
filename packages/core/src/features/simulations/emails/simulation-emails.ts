import type { GroupTemplateId } from '../../emails/email.constant.ts'
import {
  MATOMO_CAMPAIGN_EMAIL_AUTOMATISE,
  MATOMO_CAMPAIGN_KEY,
  MATOMO_KEYWORD_KEY,
  MATOMO_KEYWORDS,
  TemplateIds,
} from '../../emails/email.constant.ts'
import type { SendEmail } from '../../emails/types.ts'
import type { ISOSupportedLanguage } from '../../geo/types/language.ts'
import type { Simulation } from '../types/simulation.ts'
import { mapComputedResultsToContactAttributes } from './map-computed-results-to-contact-attributes.ts'

type Email = Parameters<SendEmail>[0]

type EmailUser = Readonly<{
  id: string
  name: string | null
  email: string
}>

type EmailGroup = Readonly<{
  id: string
  name: string
}>

type EmailOrganisation = Readonly<{
  name: string
  slug: string
}>

type EmailPoll = Readonly<{
  slug: string
}>

type GroupEmailParams = Readonly<{
  origin: string
  group: EmailGroup
  user: EmailUser
}>

type PollJoinedEmailParams = Readonly<{
  email: string
  origin: string
  locale: ISOSupportedLanguage
  organisation: EmailOrganisation
  poll: EmailPoll
  simulationId: string
}>

type SimulationCompletedEmailParams = Readonly<{
  email: string
  origin: string
  locale: ISOSupportedLanguage
  simulationId: string
  computedResults: Simulation['computedResults']
}>

const createGroupEmail = ({
  origin,
  templateId,
  group: { id: groupId, name: groupName },
  user: { email, name: userName },
}: GroupEmailParams & Readonly<{ templateId: GroupTemplateId }>): Email => {
  const groupUrl = new URL(`${origin}/amis/resultats`)
  const { searchParams: groupSp } = groupUrl
  groupSp.append('groupId', groupId)
  groupSp.append(MATOMO_CAMPAIGN_KEY, MATOMO_CAMPAIGN_EMAIL_AUTOMATISE)
  groupSp.append(MATOMO_KEYWORD_KEY, MATOMO_KEYWORDS[templateId].GROUP_URL)

  const shareUrl = new URL(`${origin}/amis/invitation`)
  const { searchParams: shareSp } = shareUrl
  shareSp.append('groupId', groupId)
  shareSp.append(MATOMO_CAMPAIGN_KEY, MATOMO_CAMPAIGN_EMAIL_AUTOMATISE)
  shareSp.append(MATOMO_KEYWORD_KEY, MATOMO_KEYWORDS[templateId].SHARE_URL)

  return {
    email,
    templateId,
    params: {
      GROUP_URL: groupUrl.toString(),
      SHARE_URL: shareUrl.toString(),
      GROUP_NAME: groupName,
      NAME: userName,
    },
  }
}

const createPollJoinedEmail = ({
  email,
  locale,
  origin,
  organisation: { name, slug: organisationSlug },
  poll: { slug: pollSlug },
  simulationId,
}: PollJoinedEmailParams): Email => {
  const templateId = TemplateIds[locale].ORGANISATION_JOINED

  const detailedViewUrl = new URL(
    `${origin}/organisations/${organisationSlug}/campagnes/${pollSlug}`
  )
  const { searchParams: detailedViewUrlSearchParams } = detailedViewUrl
  detailedViewUrlSearchParams.append(
    MATOMO_CAMPAIGN_KEY,
    MATOMO_CAMPAIGN_EMAIL_AUTOMATISE
  )
  detailedViewUrlSearchParams.append(
    MATOMO_KEYWORD_KEY,
    MATOMO_KEYWORDS[templateId]
  )

  const simulationUrl = new URL(origin)
  simulationUrl.pathname = 'fin'
  const { searchParams: simulationUrlSearchParams } = simulationUrl
  simulationUrlSearchParams.append('sid', simulationId)
  simulationUrlSearchParams.append(
    MATOMO_CAMPAIGN_KEY,
    MATOMO_CAMPAIGN_EMAIL_AUTOMATISE
  )
  simulationUrlSearchParams.append(
    MATOMO_KEYWORD_KEY,
    MATOMO_KEYWORDS[TemplateIds.fr.SIMULATION_COMPLETED]
  )

  return {
    email,
    templateId,
    params: {
      ORGANISATION_NAME: name,
      DETAILED_VIEW_URL: detailedViewUrl.toString(),
      SIMULATION_URL: simulationUrl.toString(),
    },
  }
}

const createSimulationCompletedEmail = ({
  email,
  locale,
  origin,
  simulationId,
  computedResults,
}: SimulationCompletedEmailParams): Email => {
  const templateId = TemplateIds[locale].SIGN_UP_SIMULATION_COMPLETED

  const simulationUrl = new URL(origin)
  simulationUrl.pathname = 'fin'
  const { searchParams } = simulationUrl
  searchParams.append('sid', simulationId)
  searchParams.append(MATOMO_CAMPAIGN_KEY, MATOMO_CAMPAIGN_EMAIL_AUTOMATISE)
  searchParams.append(MATOMO_KEYWORD_KEY, MATOMO_KEYWORDS[templateId])

  const dashboardUrl = new URL(`${origin}/mon-espace`)

  return {
    email,
    templateId,
    params: {
      SIMULATION_URL: simulationUrl.toString(),
      DASHBOARD_URL: dashboardUrl.toString(),
      ...mapComputedResultsToContactAttributes(computedResults, locale),
    },
  }
}

export const createSendGroupCreatedEmail =
  (sendEmail: SendEmail) => (params: GroupEmailParams) =>
    sendEmail(
      createGroupEmail({ ...params, templateId: TemplateIds.fr.GROUP_CREATED })
    )

export const createSendGroupJoinedEmail =
  (sendEmail: SendEmail) => (params: GroupEmailParams) =>
    sendEmail(
      createGroupEmail({ ...params, templateId: TemplateIds.fr.GROUP_JOINED })
    )

export const createSendPollJoinedEmail =
  (sendEmail: SendEmail) => (params: PollJoinedEmailParams) =>
    sendEmail(createPollJoinedEmail(params))

export const createSendSimulationCompletedEmail =
  (sendEmail: SendEmail) => (params: SimulationCompletedEmailParams) =>
    sendEmail(createSimulationCompletedEmail(params))
