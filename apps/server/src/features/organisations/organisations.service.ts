import {
  GetObjectCommand,
  ObjectCannedACL,
  PutObjectCommand,
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import type { Request } from 'express'
import { utils, write } from 'xlsx'
import { prisma } from '../../adapters/prisma/client.js'
import type { Organisation } from '../../adapters/prisma/generated.js'
import type { Session } from '../../adapters/prisma/transaction.js'
import { transaction } from '../../adapters/prisma/transaction.js'
import { client } from '../../adapters/scaleway/client.js'
import { config } from '../../config.js'
import { deepMergeSubstract } from '../../core/deep-merge.js'
import { EntityNotFoundException } from '../../core/errors/EntityNotFoundException.js'
import { ForbiddenException } from '../../core/errors/ForbiddenException.js'
import { EventBus } from '../../core/event-bus/event-bus.js'
import type { Locales } from '../../core/i18n/constant.js'
import type { PaginationQuery } from '../../core/pagination.js'
import {
  isPrismaErrorNotFound,
  isPrismaErrorUniqueConstraintFailed,
} from '../../core/typeguards/isPrismaError.js'
import logger from '../../logger.js'
import {
  createToken,
  verifyCode,
} from '../authentication/authentication.service.js'
import type { JobParams } from '../jobs/jobs.repository.js'
import { JobKind } from '../jobs/jobs.repository.js'
import {
  bootstrapJob,
  getPendingJobStatus,
  JobFilesRootPath,
} from '../jobs/jobs.service.js'
import type { SimulationAsyncEvent } from '../simulations/events/SimulationUpserted.event.js'
import {
  getPollSimulationsExcelData,
  getPollStats,
} from '../simulations/simulations.service.js'
import { OrganisationCreatedEvent } from './events/OrganisationCreated.event.js'
import { OrganisationUpdatedEvent } from './events/OrganisationUpdated.event.js'
import { PollCreatedEvent } from './events/PollCreated.event.js'
import { PollDeletedEvent } from './events/PollDeletedEvent.js'
import { PollUpdatedEvent } from './events/PollUpdated.event.js'
import {
  createOrganisationAndAdministrator,
  createOrganisationPoll,
  deleteOrganisationPoll,
  fetchOrganisationPoll,
  fetchOrganisationPolls,
  fetchOrganisationPublicPoll,
  fetchUserOrganisation,
  fetchUserOrganisations,
  findOrganisationPollById,
  findOrganisationPollBySlugOrId,
  findSimulationPoll,
  setPollStats,
  updateAdministratorOrganisation,
  updateOrganisationPoll,
} from './organisations.repository.js'
import {
  OrganisationPollCustomAdditionalQuestions,
  type OrganisationCreateDto,
  type OrganisationParams,
  type OrganisationPollCreateDto,
  type OrganisationPollParams,
  type OrganisationPollUpdateDto,
  type OrganisationUpdateDto,
  type PublicPollParams,
} from './organisations.validator.js'

const { bucket, rootPath } = config.thirdParty.scaleway

const organisationToDto = (
  organisation: Organisation &
    Partial<Awaited<ReturnType<typeof fetchUserOrganisation>>>,
  connectedUserEmail: string
) => ({
  ...organisation,
  hasCustomQuestionEnabled:
    config.app.organisationIdsWithCustomQuestionsEnabled.has(organisation.id),
  administrators: organisation.administrators?.map(
    ({
      id,
      user: {
        id: userId,
        name,
        email: userEmail,
        createdAt,
        optedInForCommunications,
        position,
        telephone,
        updatedAt,
      },
    }) => ({
      ...(userEmail === connectedUserEmail
        ? {
            id,
            userId,
            name,
            email: userEmail,
            position,
            telephone,
            optedInForCommunications,
            createdAt,
            updatedAt,
          }
        : {
            id,
            name,
            position,
            createdAt,
            updatedAt,
          }),
    })
  ),
})

export const createOrganisation = async ({
  organisationDto,
  locale,
  origin,
  user,
}: {
  organisationDto: OrganisationCreateDto
  locale: Locales
  origin: string
  user: NonNullable<Request['user']>
}) => {
  try {
    const { organisation, administrator } = await transaction((session) =>
      createOrganisationAndAdministrator(organisationDto, user, { session })
    )

    const organisationCreatedEvent = new OrganisationCreatedEvent({
      administrator,
      organisation,
      locale,
      origin,
    })

    EventBus.emit(organisationCreatedEvent)

    await EventBus.once(organisationCreatedEvent)

    return organisationToDto(organisation, user.email)
  } catch (e) {
    if (isPrismaErrorUniqueConstraintFailed(e)) {
      throw new ForbiddenException(
        "Forbidden ! An organisation with this administrator's email already exists."
      )
    }
    throw e
  }
}

export const updateOrganisation = async ({
  params,
  organisationDto,
  code,
  user,
}: {
  params: OrganisationParams
  organisationDto: OrganisationUpdateDto
  code?: string
  user: NonNullable<Request['user']>
}) => {
  let token: string | undefined
  const { administrators: [{ email }] = [{}] } = organisationDto
  if (email && email !== user.email) {
    if (!code) {
      throw new ForbiddenException(
        'Forbidden ! Cannot update administrator email without a verification code.'
      )
    }

    try {
      await verifyCode({
        ...user,
        code,
        email,
      })
    } catch (e) {
      if (e instanceof EntityNotFoundException) {
        throw new ForbiddenException('Forbidden ! Invalid verification code.')
      }
      throw e
    }
  }

  try {
    const { organisation, administrator } = await transaction((session) =>
      updateAdministratorOrganisation(params, organisationDto, user, {
        session,
      })
    )
    if (administrator) {
      token = createToken(administrator)
    }
    const organisationUpdatedEvent = new OrganisationUpdatedEvent({
      administrator,
      organisation,
    })

    EventBus.emit(organisationUpdatedEvent)

    await EventBus.once(organisationUpdatedEvent)

    return {
      token,
      organisation: organisationToDto(organisation, user.email),
    }
  } catch (e) {
    if (isPrismaErrorNotFound(e)) {
      throw new EntityNotFoundException('Organisation not found')
    }
    if (isPrismaErrorUniqueConstraintFailed(e)) {
      throw new ForbiddenException(
        'Forbidden ! This email already belongs to another organisation.'
      )
    }
    throw e
  }
}

export const fetchOrganisations = async ({
  user,
  query,
}: {
  user: NonNullable<Request['user']>
  query: PaginationQuery
}) => {
  const { organisations, count } = await transaction(
    (session) => fetchUserOrganisations(user, { session, query }),
    prisma
  )

  return {
    organisations: organisations.map((organisation) =>
      organisationToDto(organisation, user.email)
    ),
    count,
  }
}

export const fetchOrganisation = async ({
  params,
  user,
}: {
  params: OrganisationParams
  user: NonNullable<Request['user']>
}) => {
  try {
    const organisation = await transaction(
      (session) => fetchUserOrganisation(params, user, { session }),
      prisma
    )

    return organisationToDto(organisation, user.email)
  } catch (e) {
    if (isPrismaErrorNotFound(e)) {
      throw new EntityNotFoundException('Organisation not found')
    }
    throw e
  }
}

type PollData = Awaited<ReturnType<typeof fetchOrganisationPoll>>
type PollSimulationsInfos = PollData['simulationsInfos']
type PollOrganisation = PollData['organisation']
type PollPopulated = PollData['poll']

const isOrganisationAdmin = (
  organisation: PollOrganisation,
  connectedUser?: NonNullable<Request['user']> | string
): connectedUser is NonNullable<Request['user']> =>
  typeof connectedUser === 'object' &&
  organisation.administrators.some(
    ({ user }) => user.email === connectedUser.email
  )

const pollToDto = ({
  poll: { organisationId: _1, computeRealTimeStats: _2, ...poll },
  simulationsInfos: { count, finished, hasParticipated },
  simulationsInfos,
  organisation,
  user,
}: {
  poll: PollPopulated
  simulationsInfos: PollSimulationsInfos
  organisation: PollOrganisation
  user?: NonNullable<Request['user']> | string
}) => ({
  ...poll,
  ...(organisation
    ? {
        organisation: isOrganisationAdmin(organisation, user)
          ? organisationToDto(organisation, user.email)
          : {
              id: organisation.id,
              name: organisation.name,
              slug: organisation.slug,
            },
      }
    : {}),
  defaultAdditionalQuestions: poll.defaultAdditionalQuestions?.map(
    ({ type }) => type
  ),
  simulations: {
    count,
    finished,
    hasParticipated,
  },
  ...(simulationsInfos.hasParticipated
    ? {
        userComputedResults: simulationsInfos.userComputedResults,
        ...(poll.computedResults
          ? {
              otherComputedResults: deepMergeSubstract(
                poll.computedResults,
                simulationsInfos.userComputedResults
              ),
            }
          : {}),
      }
    : {}),
})

export const createPoll = async ({
  user,
  locale,
  origin,
  params,
  pollDto,
}: {
  origin: string
  params: OrganisationParams
  pollDto: OrganisationPollCreateDto
  user: NonNullable<Request['user']>
  locale: Locales
}) => {
  try {
    const { poll, organisation, simulationsInfos } = await transaction(
      (session) => createOrganisationPoll(params, pollDto, user, { session })
    )

    const pollCreatedEvent = new PollCreatedEvent({
      organisation,
      locale,
      origin,
      poll,
    })

    EventBus.emit(pollCreatedEvent)

    await EventBus.once(pollCreatedEvent)

    return pollToDto({ poll, organisation, simulationsInfos, user })
  } catch (e) {
    if (isPrismaErrorNotFound(e)) {
      throw new EntityNotFoundException('Organisation not found')
    }
    throw e
  }
}

export const updatePoll = async ({
  params,
  pollDto,
  user,
}: {
  params: OrganisationPollParams
  pollDto: OrganisationPollUpdateDto
  user: NonNullable<Request['user']>
}) => {
  try {
    const { poll, organisation, simulationsInfos } = await transaction(
      (session) => updateOrganisationPoll(params, pollDto, user, { session })
    )

    const pollUpdatedEvent = new PollUpdatedEvent({ poll, organisation })

    EventBus.emit(pollUpdatedEvent)

    await EventBus.once(pollUpdatedEvent)

    return pollToDto({ poll, organisation, simulationsInfos, user })
  } catch (e) {
    if (isPrismaErrorNotFound(e)) {
      throw new EntityNotFoundException('Poll not found')
    }
    throw e
  }
}

export const deletePoll = async ({
  params,
  user,
}: {
  params: OrganisationPollParams
  user: NonNullable<Request['user']>
}) => {
  try {
    const { organisation } = await transaction((session) =>
      deleteOrganisationPoll(params, user, { session })
    )

    const pollDeletedEvent = new PollDeletedEvent({ organisation })

    EventBus.emit(pollDeletedEvent)

    await EventBus.once(pollDeletedEvent)
  } catch (e) {
    if (isPrismaErrorNotFound(e)) {
      throw new EntityNotFoundException('Poll not found')
    }
    throw e
  }
}

export const fetchPolls = async ({
  params,
  user,
}: {
  params: OrganisationParams
  user: NonNullable<Request['user']>
}) => {
  try {
    const { organisation, polls } = await transaction(
      (session) => fetchOrganisationPolls(params, user, { session }),
      prisma
    )

    return polls.map(({ poll, simulationsInfos }) =>
      pollToDto({ poll, user, simulationsInfos, organisation })
    )
  } catch (e) {
    if (isPrismaErrorNotFound(e)) {
      throw new EntityNotFoundException('Organisation not found')
    }
    throw e
  }
}

export const fetchPoll = async ({
  params,
  user,
}: {
  params: OrganisationPollParams
  user: NonNullable<Request['user']>
}) => {
  try {
    const { poll, organisation, simulationsInfos } = await transaction(
      (session) => fetchOrganisationPoll(params, user, { session }),
      prisma
    )

    return pollToDto({ poll, organisation, simulationsInfos, user })
  } catch (e) {
    if (isPrismaErrorNotFound(e)) {
      throw new EntityNotFoundException('Poll not found')
    }
    throw e
  }
}

export const fetchPublicPoll = async ({
  params,
  user,
}: {
  params: PublicPollParams
  user?: NonNullable<Request['user']>
}) => {
  try {
    const { poll, organisation, simulationsInfos } = await transaction(
      (session) =>
        fetchOrganisationPublicPoll(
          {
            ...params,
            user,
          },
          { session }
        ),
      prisma
    )

    return pollToDto({
      poll,
      organisation,
      simulationsInfos,
      user: user || params.userId,
    })
  } catch (e) {
    if (isPrismaErrorNotFound(e)) {
      throw new EntityNotFoundException('Poll not found')
    }
    throw e
  }
}

export const updatePollStats = async (
  { pollId, simulation }: { pollId: string; simulation?: SimulationAsyncEvent },
  { session }: { session: Session }
) => {
  const stats = await getPollStats({ id: pollId, simulation }, { session })

  await setPollStats(pollId, stats, { session })
}

export const updatePollStatsAfterSimulationChange = async ({
  simulation,
  created,
}: {
  simulation: SimulationAsyncEvent
  created: boolean
}) => {
  try {
    return await transaction(async (session) => {
      const simulationPoll = await findSimulationPoll(
        { simulationId: simulation.id },
        { session }
      )

      if (!simulationPoll || !simulationPoll.poll.computeRealTimeStats) {
        return
      }

      const { pollId } = simulationPoll

      return updatePollStats(
        { pollId, ...(created ? { simulation } : {}) },
        { session }
      )
    }, prisma)
  } catch (e) {
    logger.error('Poll funFacts update failed', e)
  }
}

export const startDownloadPollSimulationResultJob = async ({
  params,
  user,
}: {
  params: OrganisationPollParams
  user: NonNullable<Request['user']>
}) => {
  try {
    return await transaction(async (session) => {
      const { id: pollId, organisationId } =
        await findOrganisationPollBySlugOrId(
          {
            params,
            user,
            select: {
              id: true,
              organisationId: true,
            },
          },
          { session }
        )

      return bootstrapJob(
        {
          params: {
            kind: JobKind.DOWNLOAD_ORGANISATION_POLL_SIMULATIONS_RESULT,
            organisationId,
            pollId,
          },
          user,
        },
        {
          session,
        }
      )
    }, prisma)
  } catch (e) {
    if (isPrismaErrorNotFound(e)) {
      throw new EntityNotFoundException('Poll not found')
    }
    throw e
  }
}

export const getDownloadPollSimulationResultJob = async ({
  params,
  jobId,
  user,
}: {
  user: NonNullable<Request['user']>
  params: OrganisationPollParams
  jobId: string
}) => {
  try {
    const { id: pollId, organisationId } = await findOrganisationPollBySlugOrId(
      {
        params,
        user,
        select: {
          id: true,
          organisationId: true,
        },
      },
      { session: prisma }
    )

    return getPendingJobStatus(
      {
        user,
        id: jobId,
        params: {
          kind: JobKind.DOWNLOAD_ORGANISATION_POLL_SIMULATIONS_RESULT,
          organisationId,
          pollId,
        },
      },
      {
        session: prisma,
      }
    )
  } catch (e) {
    if (isPrismaErrorNotFound(e)) {
      throw new EntityNotFoundException('Poll not found')
    }
    throw e
  }
}

const generatePollSimulationsResultExcel = async (
  {
    pollId,
  }: JobParams<typeof JobKind.DOWNLOAD_ORGANISATION_POLL_SIMULATIONS_RESULT>,
  { session }: { session: Session }
) => {
  const { id, slug, customAdditionalQuestions } =
    await findOrganisationPollById(
      {
        id: pollId,
        select: {
          id: true,
          slug: true,
          customAdditionalQuestions: true,
        },
      },
      { session }
    )

  const excelData = await getPollSimulationsExcelData(
    {
      id,
      customAdditionalQuestions:
        OrganisationPollCustomAdditionalQuestions.parse(
          customAdditionalQuestions
        ),
    },
    { session }
  )

  const worksheet = utils.json_to_sheet(excelData)

  const workbook = utils.book_new()

  utils.book_append_sheet(workbook, worksheet, 'Simulations')

  return {
    buffer: write(workbook, { type: 'buffer', bookType: 'xlsx' }),
    filename: `Export_${slug}_Simulations.xlsx`,
  }
}

export const uploadPollSimulationsResult = async (
  params: JobParams<
    typeof JobKind.DOWNLOAD_ORGANISATION_POLL_SIMULATIONS_RESULT
  >
) => {
  try {
    const { buffer, filename } = await transaction(
      async (session) =>
        generatePollSimulationsResultExcel(params, { session }),
      prisma
    )

    const key = `${rootPath}/${JobFilesRootPath[params.kind]}/${filename}`

    await client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: buffer,
        ACL: ObjectCannedACL.private,
      })
    )

    const url = await getSignedUrl(
      client,
      new GetObjectCommand({
        Bucket: bucket,
        Key: key,
      }),
      { expiresIn: 60 * 10 } // 10 minutes
    )

    return { url }
  } catch (e) {
    if (isPrismaErrorNotFound(e)) {
      throw new EntityNotFoundException('Poll not found')
    }

    throw e
  }
}
