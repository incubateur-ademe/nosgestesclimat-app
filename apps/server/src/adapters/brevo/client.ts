import type { AxiosError } from 'axios'
import axios, { isAxiosError } from 'axios'
import axiosRetry from 'axios-retry'
import dayjs from 'dayjs'
import { z } from 'zod'
import { config } from '../../config.js'
import { Locales } from '../../core/i18n/constant.js'
import { isNetworkOrTimeoutOrRetryableError } from '../../core/typeguards/isRetryableAxiosError.js'
import type {
  ActionChoicesSchema,
  ComputedResultSchema,
} from '../../features/simulations/simulations.validator.js'
import type {
  Group,
  Organisation,
  OrganisationType,
  Poll,
  Simulation,
  User,
  VerifiedUser,
} from '../prisma/generated.js'
import type { GroupTemplateId, TemplateId } from './constant.js'
import {
  AllNewsletters,
  Attributes,
  ClientErrors,
  ListIds,
  MATOMO_CAMPAIGN_EMAIL_AUTOMATISE,
  MATOMO_CAMPAIGN_KEY,
  MATOMO_KEYWORD_KEY,
  MATOMO_KEYWORDS,
  TemplateIds,
} from './constant.js'

const brevo = axios.create({
  baseURL: config.thirdParty.brevo.url,
  headers: {
    'api-key': config.thirdParty.brevo.apiKey,
  },
  timeout: 1000,
})

axiosRetry(brevo, {
  retryCondition: isNetworkOrTimeoutOrRetryableError,
  retryDelay: () => 200,
  shouldResetTimeout: true,
})

const isBrevoClientError =
  <Error extends ClientErrors>({ code, status }: Error) =>
  (
    error: AxiosError
  ): error is AxiosError & {
    response: { status: Error['status']; data: { code: Error['code'] } }
  } => {
    return (
      error.response?.status === status &&
      !!error.response.data &&
      typeof error.response.data === 'object' &&
      'code' in error.response.data &&
      error.response.data.code === code
    )
  }

export const isBadRequest = isBrevoClientError(ClientErrors.BAD_REQUEST)

export const isNotFound = isBrevoClientError(ClientErrors.NOT_FOUND)

export const isTimeout = (error: AxiosError) => error.code === 'ECONNABORTED'

type BrevoNewsletterDto = {
  id: number
  name: string
  startDate: string
  endDate: string
  totalBlacklisted: number
  totalSubscribers: number
  uniqueSubscribers: number
  folderId: number
  createdAt: string
  dynamicList: boolean
}

export const fetchNewsletter = (listId: number) => {
  return brevo.get<BrevoNewsletterDto>(`/v3/contacts/lists/${listId}`)
}

export type BrevoContactDto = {
  email: string
  id: number
  emailBlacklisted: boolean
  smsBlacklisted: boolean
  createdAt: string
  modifiedAt: string
  attributes: Record<string, string | number | boolean | null>
  listIds: number[]
  statistics: unknown
}

const BrevoContactSchema = z.object({
  id: z.number(),
  email: z.string(),
  listIds: z.array(z.number()),
})

export type BrevoContact = z.infer<typeof BrevoContactSchema>

export const fetchContactOrThrow = async (email: string) => {
  const { data } = await brevo.get<BrevoContactDto>(
    `/v3/contacts/${encodeURIComponent(email)}`
  )

  return BrevoContactSchema.parse(data)
}

export const fetchContact = async (email: string) => {
  try {
    return await fetchContactOrThrow(email)
  } catch (e) {
    if (isAxiosError(e) && isNotFound(e)) {
      return
    }

    throw e
  }
}

export const deleteContact = async (email: string) => {
  try {
    await brevo.delete<BrevoContactDto>(
      `/v3/contacts/${encodeURIComponent(email)}`
    )
  } catch (e) {
    if (isAxiosError(e) && isNotFound(e)) {
      return
    }

    throw e
  }
}

const sendEmail = ({
  email,
  templateId,
  params,
}: {
  email: string
  templateId: TemplateId
  params: { [key: string]: unknown }
}) => {
  return brevo.post('/v3/smtp/email', {
    to: [
      {
        name: email,
        email,
      },
    ],
    templateId,
    params,
  })
}

const lastSimulationResult = ({
  computedResults,
  locale,
}: {
  computedResults?: ComputedResultSchema | null
  locale: Locales
}) => {
  const bilan = computedResults?.carbone?.bilan ?? 0
  const transport = computedResults?.carbone?.categories?.transport ?? 0
  const alimentation = computedResults?.carbone?.categories?.alimentation ?? 0
  const logement = computedResults?.carbone?.categories?.logement ?? 0
  const divers = computedResults?.carbone?.categories?.divers ?? 0
  const services =
    computedResults?.carbone?.categories?.['services sociétaux'] ?? 0
  const eau = computedResults?.eau?.bilan ?? 0

  return {
    [Attributes.LAST_SIMULATION_BILAN_FOOTPRINT]: (
      bilan / NUMBER_OF_KG_IN_A_TON
    ).toLocaleString(locale, {
      maximumFractionDigits: 1,
    }),
    [Attributes.LAST_SIMULATION_TRANSPORTS_FOOTPRINT]: (
      transport / NUMBER_OF_KG_IN_A_TON
    ).toLocaleString(locale, {
      maximumFractionDigits: 1,
    }),
    [Attributes.LAST_SIMULATION_ALIMENTATION_FOOTPRINT]: (
      alimentation / NUMBER_OF_KG_IN_A_TON
    ).toLocaleString(locale, {
      maximumFractionDigits: 1,
    }),
    [Attributes.LAST_SIMULATION_LOGEMENT_FOOTPRINT]: (
      logement / NUMBER_OF_KG_IN_A_TON
    ).toLocaleString(locale, {
      maximumFractionDigits: 1,
    }),
    [Attributes.LAST_SIMULATION_DIVERS_FOOTPRINT]: (
      divers / NUMBER_OF_KG_IN_A_TON
    ).toLocaleString(locale, {
      maximumFractionDigits: 1,
    }),
    [Attributes.LAST_SIMULATION_SERVICES_FOOTPRINT]: (
      services / NUMBER_OF_KG_IN_A_TON
    ).toLocaleString(locale, {
      maximumFractionDigits: 1,
    }),
    [Attributes.LAST_SIMULATION_BILAN_WATER]: Math.round(
      eau / NUMBER_OF_DAYS_IN_A_YEAR
    ).toString(),
  }
}

export const sendVerificationCodeEmail = ({
  locale,
  email,
  code,
}: Readonly<{
  email: string
  code: string
  locale: Locales
}>) => {
  return sendEmail({
    email,
    templateId: TemplateIds[locale].VERIFICATION_CODE,
    params: {
      VERIFICATION_CODE: code,
    },
  })
}

export const sendAPITokenLinkEmail = ({
  origin,
  email,
  code,
}: Readonly<{
  origin: string
  email: string
  code: string
  locale: Locales
}>) => {
  const apiTokenUrl = new URL(`${origin}/integrations-api/v1/tokens`)
  const { searchParams } = apiTokenUrl
  searchParams.append('code', code)
  searchParams.append('email', email)

  return sendEmail({
    email,
    templateId: TemplateIds[Locales.fr].API_VERIFICATION_CODE,
    params: {
      API_TOKEN_URL: apiTokenUrl.toString(),
    },
  })
}

export const sendWelcomeEmail = ({
  email,
  locale,
  origin,
}: Readonly<{
  origin: string
  email: string
  locale: Locales
}>) => {
  const dashBoardUrl = new URL(`${origin}/mon-espace`)

  return sendEmail({
    email,
    templateId: TemplateIds[locale].SIGN_UP,
    params: {
      DASHBOARD_URL: dashBoardUrl.toString(),
    },
  })
}

const sendGroupEmail = ({
  origin,
  templateId,
  group: { id: groupId, name: groupName },
  user: { id: userId, email, name: userName },
}: Readonly<{
  origin: string
  group: Pick<Group, 'id' | 'name'>
  user: Pick<User, 'id' | 'name'> & { email: string }
  templateId: GroupTemplateId
}>) => {
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

  const deleteUrl = new URL(`${origin}/amis/supprimer`)
  const { searchParams: deleteSp } = deleteUrl
  deleteSp.append('groupId', groupId)
  deleteSp.append('userId', userId)
  deleteSp.append(MATOMO_CAMPAIGN_KEY, MATOMO_CAMPAIGN_EMAIL_AUTOMATISE)
  deleteSp.append(MATOMO_KEYWORD_KEY, MATOMO_KEYWORDS[templateId].DELETE_URL)

  return sendEmail({
    email,
    templateId,
    params: {
      GROUP_URL: groupUrl.toString(),
      SHARE_URL: shareUrl.toString(),
      DELETE_URL: deleteUrl.toString(),
      GROUP_NAME: groupName,
      NAME: userName,
    },
  })
}

export const sendGroupCreatedEmail = ({
  origin,
  group,
  user,
}: Readonly<{
  origin: string
  group: Pick<Group, 'id' | 'name'>
  user: Pick<User, 'id' | 'name'> & { email: string }
}>) => {
  return sendGroupEmail({
    templateId: TemplateIds[Locales.fr].GROUP_CREATED,
    origin,
    group,
    user,
  })
}

export const sendOrganisationCreatedEmail = ({
  locale,
  origin,
  organisation: { name: organisationName, slug },
  administrator: { name: administratorName, email },
}: Readonly<{
  origin: string
  locale: Locales
  organisation: Pick<Organisation, 'name' | 'slug'>
  administrator: Pick<VerifiedUser, 'name' | 'email'>
}>) => {
  const templateId = TemplateIds[locale].ORGANISATION_CREATED
  const dashBoardUrl = new URL(`${origin}/organisations/${slug}`)
  const { searchParams } = dashBoardUrl
  searchParams.append(MATOMO_CAMPAIGN_KEY, MATOMO_CAMPAIGN_EMAIL_AUTOMATISE)
  searchParams.append(MATOMO_KEYWORD_KEY, MATOMO_KEYWORDS[templateId])

  return sendEmail({
    email,
    templateId,
    params: {
      ADMINISTRATOR_NAME: administratorName,
      ORGANISATION_NAME: organisationName,
      DASHBOARD_URL: dashBoardUrl.toString(),
    },
  })
}

export const sendPollCreatedEmail = ({
  locale,
  origin,
  organisation: { name: organisationName, slug: organisationSlug },
  poll: { name: pollName, slug: pollSlug },
  administrator: { name: administratorName, email },
}: Readonly<{
  origin: string
  locale: Locales
  organisation: Pick<Organisation, 'name' | 'slug'>
  poll: Pick<Poll, 'name' | 'slug'>
  administrator: Pick<VerifiedUser, 'name' | 'email'>
}>) => {
  const templateId = TemplateIds[locale].POLL_CREATED
  const dashboardUrl = new URL(
    `${origin}/organisations/${organisationSlug}/campagnes/${pollSlug}`
  )
  const { searchParams: dashboardSearchParams } = dashboardUrl
  dashboardSearchParams.append(
    MATOMO_CAMPAIGN_KEY,
    MATOMO_CAMPAIGN_EMAIL_AUTOMATISE
  )
  dashboardSearchParams.append(MATOMO_KEYWORD_KEY, MATOMO_KEYWORDS[templateId])

  const pollUrl = new URL(`${origin}/o/${organisationSlug}/${pollSlug}`)
  const { searchParams: pollSearchParams } = pollUrl
  pollSearchParams.append(
    MATOMO_CAMPAIGN_KEY,
    `Organisation_${organisationName}`
  )
  pollSearchParams.append(MATOMO_KEYWORD_KEY, pollName)

  return sendEmail({
    email,
    templateId,
    params: {
      ADMINISTRATOR_NAME: administratorName,
      DASHBOARD_URL: dashboardUrl.toString(),
      POLL_URL: pollUrl.toString(),
      POLL_NAME: pollName,
    },
  })
}

export const sendSimulationUpsertedEmail = ({
  email,
  origin,
  locale,
  verified,
  simulation,
}: Readonly<{
  email: string
  origin: string
  locale: Locales
  verified: boolean
  simulation: Pick<Simulation, 'id' | 'progression' | 'computedResults'>
}>) => {
  const isSimulationCompleted = simulation.progression === 1

  if (verified) {
    // TODO send in progress email when autheticated
    if (!isSimulationCompleted) {
      return
    }

    const templateId = TemplateIds[locale].SIGN_UP_SIMULATION_COMPLETED

    const simulationUrl = new URL(origin)
    simulationUrl.pathname = isSimulationCompleted ? 'fin' : 'simulateur/bilan'
    const { searchParams } = simulationUrl
    searchParams.append('sid', simulation.id)
    searchParams.append(MATOMO_CAMPAIGN_KEY, MATOMO_CAMPAIGN_EMAIL_AUTOMATISE)
    searchParams.append(MATOMO_KEYWORD_KEY, MATOMO_KEYWORDS[templateId])

    const dashBoardUrl = new URL(`${origin}/mon-espace`)

    return sendEmail({
      email,
      templateId,
      params: {
        SIMULATION_URL: simulationUrl.toString(),
        DASHBOARD_URL: dashBoardUrl.toString(),
        ...lastSimulationResult({
          locale,
          computedResults:
            simulation.computedResults as ComputedResultSchema | null,
        }),
      },
    })
  }

  const templateId = isSimulationCompleted
    ? TemplateIds[Locales.fr].SIMULATION_COMPLETED
    : TemplateIds[Locales.fr].SIMULATION_IN_PROGRESS

  const simulationUrl = new URL(origin)
  simulationUrl.pathname = isSimulationCompleted ? 'fin' : 'simulateur/bilan'
  const { searchParams } = simulationUrl
  searchParams.append('sid', simulation.id)
  searchParams.append(MATOMO_CAMPAIGN_KEY, MATOMO_CAMPAIGN_EMAIL_AUTOMATISE)
  searchParams.append(MATOMO_KEYWORD_KEY, MATOMO_KEYWORDS[templateId])

  return sendEmail({
    email,
    templateId,
    params: {
      SIMULATION_URL: simulationUrl.toString(),
      ...(isSimulationCompleted
        ? {
            ...lastSimulationResult({
              locale: Locales.fr,
              computedResults:
                simulation.computedResults as ComputedResultSchema | null,
            }),
          }
        : {}),
    },
  })
}

export const sendGroupParticipantSimulationUpsertedEmail = ({
  origin,
  group,
  user,
}: Readonly<{
  origin: string
  group: Pick<Group, 'id' | 'name'>
  user: Pick<User, 'id' | 'name'> & { email: string }
}>) => {
  return sendGroupEmail({
    templateId: TemplateIds[Locales.fr].GROUP_JOINED,
    origin,
    group,
    user,
  })
}

export const sendPollSimulationUpsertedEmail = async ({
  email,
  locale,
  origin,
  organisation: { name, slug: organisationSlug },
  poll: { slug: pollSlug },
  simulation: { id },
}: Readonly<{
  email: string
  origin: string
  locale: Locales
  organisation: Pick<Organisation, 'name' | 'slug'>
  poll: Pick<Poll, 'slug'>
  simulation: Pick<Simulation, 'id'>
}>) => {
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
  simulationUrlSearchParams.append('sid', id)
  simulationUrlSearchParams.append(
    MATOMO_CAMPAIGN_KEY,
    MATOMO_CAMPAIGN_EMAIL_AUTOMATISE
  )
  simulationUrlSearchParams.append(
    MATOMO_KEYWORD_KEY,
    MATOMO_KEYWORDS[TemplateIds[Locales.fr].SIMULATION_COMPLETED]
  )

  await sendEmail({
    email,
    templateId,
    params: {
      ORGANISATION_NAME: name,
      DETAILED_VIEW_URL: detailedViewUrl.toString(),
      SIMULATION_URL: simulationUrl.toString(),
    },
  })
}

export const sendNewsLetterConfirmationEmail = ({
  code,
  email,
  origin,
  listIds,
  newsLetterConfirmationBaseUrl,
}: {
  code: string
  email: string
  origin: string
  listIds?: number[]
  newsLetterConfirmationBaseUrl: string
}) => {
  const newsletterConfirmationUrl = new URL(
    `${newsLetterConfirmationBaseUrl}/newsletters/v1/confirmation`
  )

  const { searchParams } = newsletterConfirmationUrl
  searchParams.append('code', code)
  searchParams.append('email', email)
  searchParams.append('origin', origin)
  listIds?.forEach((l) => searchParams.append('listIds', l.toString()))

  return sendEmail({
    email,
    params: {
      NEWSLETTER_CONFIRMATION_URL: newsletterConfirmationUrl.toString(),
    },
    templateId: TemplateIds[Locales.fr].NEWSLETTER_CONFIRMATION,
  })
}

export const addOrUpdateContact = ({
  email,
  listIds,
  attributes,
}: Readonly<{
  email: string
  attributes: { [key: string]: unknown }
  listIds?: number[]
}>) => {
  return brevo.post('/v3/contacts', {
    email,
    listIds,
    attributes,
    updateEnabled: true,
  })
}

const unsubscribeContactFromList = async ({
  email,
  listId,
}: Readonly<{
  email: string
  listId: number
}>) => {
  try {
    await brevo.post(`/v3/contacts/lists/${listId}/contacts/remove`, {
      emails: [email],
    })
  } catch (e) {
    // Brevo raises if not subscribed...
    if (!isAxiosError(e) || !isBadRequest(e)) {
      throw e
    }
  }
}

export const addOrUpdateContactAfterLogin = ({
  userId,
  email,
}: {
  userId: string
  email: string
}) => {
  const attributes = {
    [Attributes.USER_ID]: userId,
  }

  return addOrUpdateContact({
    email,
    attributes,
  })
}

export const removeFromNewsletters = async ({
  email,
  listIds = [],
}: {
  email: string
  listIds?: number[]
}) => {
  for (const listId of listIds) {
    await unsubscribeContactFromList({
      email,
      listId,
    })
  }
}

export const addOrUpdateContactAfterOrganisationChange = async ({
  slug,
  email,
  userId,
  organisationName,
  administratorName,
  optedInForCommunications,
  lastPollParticipantsCount,
  type,
  pollsCreatedCount,
  organisationSimulationsCompletedCount,
  organisationLastSimulationDate,
}: {
  slug: string
  email: string
  userId: string
  organisationName: string
  lastPollParticipantsCount?: number
  administratorName?: string | null
  optedInForCommunications?: boolean
  type?: OrganisationType
  pollsCreatedCount?: number
  organisationSimulationsCompletedCount?: number
  organisationLastSimulationDate?: Date
}) => {
  const attributes = {
    [Attributes.USER_ID]: userId,
    [Attributes.IS_ORGANISATION_ADMIN]: true,
    [Attributes.ORGANISATION_NAME]: organisationName,
    [Attributes.ORGANISATION_SLUG]: slug,
    ...(lastPollParticipantsCount
      ? {
          [Attributes.LAST_POLL_PARTICIPANTS_NUMBER]: lastPollParticipantsCount,
        }
      : {}),
    [Attributes.OPT_IN]: !!optedInForCommunications,
    ...(administratorName
      ? {
          [Attributes.PRENOM]: administratorName,
        }
      : {}),
    [Attributes.ORGANISATION_TYPE]: type,
    ...(pollsCreatedCount
      ? {
          [Attributes.NUMBER_ORGANISATION_CREATED_POLLS]: pollsCreatedCount,
        }
      : {}),
    ...(organisationSimulationsCompletedCount
      ? {
          [Attributes.NUMBER_ORGANISATION_COMPLETED_SIMULATIONS]:
            organisationSimulationsCompletedCount,
        }
      : {}),
    ...(organisationLastSimulationDate
      ? {
          [Attributes.LAST_ORGANISATION_SIMULATION_DATE]: dayjs(
            organisationLastSimulationDate
          ).format('YYYY-MM-DD'),
        }
      : {}),
  }

  await addOrUpdateContact({
    email,
    attributes,
    ...(optedInForCommunications ? { listIds: [ListIds.ORGANISATIONS] } : {}),
  })

  if (!optedInForCommunications) {
    await unsubscribeContactFromList({
      email,
      listId: ListIds.ORGANISATIONS,
    })
  }
}

export const addOrUpdateAdministratorContactAfterGroupChange = async ({
  email,
  userId,
  administratorName,
  createdGroupsCount,
  lastGroupCreationDate,
  createdGroupsWithOneParticipantCount,
}: {
  email: string
  userId: string
  createdGroupsCount: number
  lastGroupCreationDate: Date | undefined
  administratorName?: string | null
  createdGroupsWithOneParticipantCount: number
}) => {
  const attributes = {
    [Attributes.USER_ID]: userId,
    [Attributes.NUMBER_CREATED_GROUPS]: createdGroupsCount,
    [Attributes.LAST_GROUP_CREATION_DATE]: lastGroupCreationDate?.toISOString(),
    [Attributes.NUMBER_CREATED_GROUPS_WITH_ONE_PARTICIPANT]:
      createdGroupsWithOneParticipantCount,
    ...(administratorName
      ? {
          [Attributes.PRENOM]: administratorName,
        }
      : {}),
  }

  await addOrUpdateContact({
    email,
    ...(createdGroupsCount > 0
      ? {
          /**
           * This list is purely technical for groups
           * TODO update CGUs or warn user that we will use his mail
           */
          listIds: [ListIds.GROUP_CREATED],
        }
      : {}),
    attributes,
  })

  if (createdGroupsCount === 0) {
    await unsubscribeContactFromList({
      email,
      listId: ListIds.GROUP_CREATED,
    })
  }
}

export const addOrUpdateParticipantContactAfterGroupChange = async ({
  email,
  joinedGroupsCount,
}: {
  email: string
  joinedGroupsCount: number
}) => {
  if (joinedGroupsCount === 0) {
    await unsubscribeContactFromList({
      email,
      listId: ListIds.GROUP_JOINED,
    })
  }
}

const NUMBER_OF_DAYS_IN_A_YEAR = 365

const NUMBER_OF_KG_IN_A_TON = 1000

export const addOrUpdateContactAfterSimulationCreated = async ({
  name,
  email,
  userId,
  newsletters,
  actionChoices,
  computedResults,
  lastSimulationDate,
  subscribeToGroupNewsletter,
}: {
  name: string | null
  email: string
  userId: string
  newsletters?: Array<ListIds>
  actionChoices?: ActionChoicesSchema
  computedResults: ComputedResultSchema
  lastSimulationDate: Date
  subscribeToGroupNewsletter: boolean
}) => {
  const attributes = {
    [Attributes.USER_ID]: userId,
    [Attributes.LAST_SIMULATION_DATE]: lastSimulationDate.toISOString(),
    [Attributes.ACTIONS_SELECTED_NUMBER]: Object.values(
      actionChoices || {}
    ).filter((v) => !!v).length,
    ...lastSimulationResult({
      locale: Locales.fr,
      computedResults,
    }),
    ...(name
      ? {
          [Attributes.PRENOM]: name,
        }
      : {}),
  }

  await addOrUpdateContact({
    email,
    attributes,
    ...(subscribeToGroupNewsletter ? { listIds: [ListIds.GROUP_JOINED] } : {}),
    ...(newsletters?.length ? { listIds: newsletters } : {}),
  })

  if (newsletters) {
    const userNewsletters = new Set(newsletters)
    for (const newsletter of AllNewsletters) {
      if (!userNewsletters.has(newsletter)) {
        await unsubscribeContactFromList({
          email,
          listId: newsletter,
        })
      }
    }
  }
}

export const addOrUpdateContactAfterIncompleteSimulationCreated = ({
  name,
  email,
  userId,
}: {
  name: string | null
  email: string
  userId: string
}) => {
  const attributes = {
    [Attributes.USER_ID]: userId,
    ...(name
      ? {
          [Attributes.PRENOM]: name,
        }
      : {}),
  }

  return addOrUpdateContact({
    email,
    attributes,
  })
}
