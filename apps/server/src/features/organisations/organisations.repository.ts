import type { FunFacts } from '@incubateur-ademe/nosgestesclimat'
import type { Request } from 'express'
import slugify from 'slugify'
import type { JsonValue } from '../../adapters/prisma/generated.ts'
import { Prisma } from '../../adapters/prisma/generated.ts'
import {
  defaultOrganisationSelection,
  defaultOrganisationSelectionWithoutPolls,
  defaultPollSelection,
  defaultVerifiedUserSelection,
} from '../../adapters/prisma/selection.ts'
import type { Session } from '../../adapters/prisma/transaction.ts'
import type { PaginationQuery } from '../../core/pagination.ts'
import type { SimulationParams } from '../simulations/simulations.validator.ts'
import { ComputedResultSchema } from '../simulations/simulations.validator.ts'
import type {
  OrganisationCreateDto,
  OrganisationParams,
  OrganisationPollCreateDto,
  OrganisationPollParams,
  OrganisationPollUpdateDto,
  OrganisationUpdateDto,
  PollParams,
  PublicPollParams,
} from './organisations.validator.ts'

const findModelUniqueSlug = (model: 'organisation' | 'poll') => {
  const findUniqueSlug = async (
    name: string,
    { session }: { session: Session },
    counter = 0
  ): Promise<string> => {
    const slug =
      counter === 0
        ? slugify.default(name.toLowerCase(), {
            strict: true,
          })
        : name

    // @ts-expect-error 2349 the two models are different but that's OK
    const entityFound = await session[model].findUnique({
      where: {
        slug: counter === 0 ? slug : `${slug}-${counter}`,
      },
      select: {
        slug: true,
      },
    })

    if (entityFound) {
      return findUniqueSlug(slug, { session }, counter + 1)
    }

    return counter === 0 ? slug : `${slug}-${counter}`
  }

  return findUniqueSlug
}

const findOrganisationBySlugOrId = <
  T extends Prisma.OrganisationSelect = { id: true },
>(
  {
    params: { organisationIdOrSlug },
    user: { email: userEmail },
    select = { id: true } as T,
  }: {
    params: OrganisationParams
    user: NonNullable<Request['user']>
    select?: T
  },
  { session }: { session: Session }
) => {
  return session.organisation.findFirstOrThrow({
    where: {
      OR: [{ id: organisationIdOrSlug }, { slug: organisationIdOrSlug }],
      administrators: {
        some: {
          userEmail,
        },
      },
    },
    select,
  })
}

export const findOrganisationPollBySlugOrId = <
  T extends Prisma.PollSelect = { id: true },
>(
  {
    params: { organisationIdOrSlug, pollIdOrSlug },
    user: { email: userEmail },
    select = { id: true } as T,
  }: {
    params: OrganisationPollParams
    user: NonNullable<Request['user']>
    select?: T
  },
  { session }: { session: Session }
) => {
  return session.poll.findFirstOrThrow({
    where: {
      OR: [{ id: pollIdOrSlug }, { slug: pollIdOrSlug }],
      organisation: {
        OR: [{ id: organisationIdOrSlug }, { slug: organisationIdOrSlug }],
        administrators: {
          some: {
            userEmail,
          },
        },
      },
    },
    select,
  })
}

export const findOrganisationPollById = <
  T extends Prisma.PollSelect = typeof defaultPollSelection,
>(
  {
    id,
    select = defaultPollSelection as T,
  }: {
    id: string
    select?: T
  },
  { session }: { session: Session }
) => {
  return session.poll.findUniqueOrThrow({
    where: { id },
    select,
  })
}

export const findOrganisationPublicPollBySlugOrId = <
  T extends Prisma.PollSelect = { id: true },
>(
  {
    params: { pollIdOrSlug },
    select = { id: true } as T,
  }: {
    params: PollParams
    select?: T
  },
  { session }: { session: Session }
) => {
  return session.poll.findFirstOrThrow({
    where: {
      OR: [{ id: pollIdOrSlug }, { slug: pollIdOrSlug }],
    },
    select,
  })
}

const findUniqueOrganisationSlug = findModelUniqueSlug('organisation')

export const createOrganisationAndAdministrator = async (
  {
    name,
    type,
    administrators: [
      {
        name: administratorName,
        telephone,
        optedInForCommunications,
        position,
      },
    ] = [{}],
    numberOfCollaborators,
  }: OrganisationCreateDto,
  { userId, email }: NonNullable<Request['user']>,
  { session }: { session: Session }
) => {
  // upsert administrator
  const administrator = await session.verifiedUser.upsert({
    where: {
      email,
    },
    create: {
      email,
      id: userId,
      name: administratorName,
      position,
      telephone,
      optedInForCommunications,
    },
    update: {
      id: userId,
      name: administratorName,
      position,
      telephone,
      optedInForCommunications,
    },
    select: defaultVerifiedUserSelection,
  })

  const slug = await findUniqueOrganisationSlug(name, {
    session,
  })

  // create organisation
  const organisation = await session.organisation.create({
    data: {
      name,
      slug,
      type,
      numberOfCollaborators,
      administrators: {
        create: {
          userEmail: email,
        },
      },
    },
    select: defaultOrganisationSelection,
  })

  return {
    organisation,
    administrator,
  }
}

export const updateAdministratorOrganisation = async (
  params: OrganisationParams,
  {
    name: organisationName,
    type,
    numberOfCollaborators,
    administrators,
  }: OrganisationUpdateDto,
  user: NonNullable<Request['user']>,
  { session }: { session: Session }
) => {
  const { email: userEmail } = user
  const organisationUpdate = {
    type,
    name: organisationName,
    numberOfCollaborators,
    administrators: {
      update: {
        where: {
          userEmail,
        },
        data: {
          userEmail,
        },
      },
    },
  }

  let administrator
  if (administrators) {
    const [
      {
        email,
        name: administratorName,
        optedInForCommunications,
        position,
        telephone,
      },
    ] = administrators

    // update administrator
    administrator = await session.verifiedUser.update({
      where: {
        email: userEmail,
      },
      data: {
        id: user.userId,
        name: administratorName,
        email,
        position,
        telephone,
        optedInForCommunications,
      },
      select: defaultVerifiedUserSelection,
    })

    if (email) {
      user.email = email
      organisationUpdate.administrators.update.where.userEmail = email
      organisationUpdate.administrators.update.data.userEmail = email
    }
  }

  // update organisation
  const organisation = await session.organisation.update({
    where: await findOrganisationBySlugOrId({ params, user }, { session }),
    data: organisationUpdate,
    select: defaultOrganisationSelection,
  })

  return {
    organisation,
    administrator,
  }
}

export const fetchUserOrganisations = async (
  { email: userEmail }: NonNullable<Request['user']>,
  {
    session,
    query: { pageSize, page },
  }: { session: Session; query: PaginationQuery }
) => {
  const where = {
    administrators: {
      some: {
        userEmail,
      },
    },
  }

  const [organisations, count] = await Promise.all([
    session.organisation.findMany({
      where,
      skip: page * pageSize,
      take: pageSize,
      select: defaultOrganisationSelection,
    }),
    session.organisation.count({ where }),
  ])

  return {
    organisations,
    count,
  }
}

export const fetchUserOrganisation = (
  params: OrganisationParams,
  user: NonNullable<Request['user']>,
  { session }: { session: Session }
) => {
  return findOrganisationBySlugOrId(
    {
      params,
      user,
      select: defaultOrganisationSelection,
    },
    { session }
  )
}

const findUniquePollSlug = findModelUniqueSlug('poll')

type SimulationsInfo = {
  count: number
  finished: number
} & (
  | {
      hasParticipated: false
    }
  | {
      hasParticipated: true
      progression: number
      userComputedResults: ComputedResultSchema
    }
)

const fetchPollSimulationsInfo = async (
  {
    poll: { id },
    user: { userId },
  }: { poll: { id: string }; user: { userId: string } },
  { session }: { session: Session }
): Promise<SimulationsInfo> => {
  const [count, finished, userSimulation] = await Promise.all([
    session.simulationPoll.count({
      where: {
        pollId: id,
      },
    }),
    session.simulationPoll.count({
      where: {
        pollId: id,
        simulation: {
          progression: 1,
        },
      },
    }),
    session.simulationPoll.findFirst({
      where: {
        pollId: id,
        simulation: {
          user: {
            id: userId,
          },
        },
      },
      select: {
        simulation: {
          select: {
            computedResults: true,
            progression: true,
          },
        },
      },
      orderBy: {
        simulation: {
          createdAt: 'desc',
        },
      },
    }),
  ])

  const userComputedResults = ComputedResultSchema.safeParse(
    userSimulation?.simulation.computedResults
  )

  return {
    count,
    finished,
    ...(userComputedResults.success
      ? {
          hasParticipated: true,
          progression: userSimulation!.simulation.progression,
          userComputedResults: userComputedResults.data,
        }
      : {
          hasParticipated: false,
        }),
  }
}

const sanitizePollComputedResults = <T extends { computedResults: JsonValue }>({
  computedResults: rawComputedResults,
  ...poll
}: T): Omit<T, 'computedResults'> & {
  computedResults: ComputedResultSchema | null
} => {
  const computedResults = ComputedResultSchema.safeParse(rawComputedResults)
  return {
    ...poll,
    ...(computedResults.success
      ? { computedResults: computedResults.data }
      : { computedResults: null }),
  }
}

export const createOrganisationPoll = async (
  params: OrganisationParams,
  {
    name,
    expectedNumberOfParticipants,
    defaultAdditionalQuestions,
    customAdditionalQuestions,
    mode,
  }: OrganisationPollCreateDto,
  user: NonNullable<Request['user']>,
  { session }: { session: Session }
) => {
  const slug = await findUniquePollSlug(name, { session })

  const {
    polls: [poll],
    ...organisation
  } = await session.organisation.update({
    where: await findOrganisationBySlugOrId({ params, user }, { session }),
    data: {
      polls: {
        create: {
          slug,
          name,
          customAdditionalQuestions: customAdditionalQuestions ?? [],
          expectedNumberOfParticipants,
          mode,
          ...(defaultAdditionalQuestions?.length
            ? {
                defaultAdditionalQuestions: {
                  createMany: {
                    data: defaultAdditionalQuestions.map((type) => ({
                      type,
                    })),
                  },
                },
              }
            : {}),
        },
      },
    },
    select: {
      ...defaultOrganisationSelection,
      polls: {
        where: {
          slug,
        },
        select: defaultPollSelection,
      },
    },
  })

  const simulationsInfos = await fetchPollSimulationsInfo(
    {
      poll,
      user,
    },
    { session }
  )

  return {
    poll: sanitizePollComputedResults(poll),
    simulationsInfos,
    organisation,
  }
}

export const updateOrganisationPoll = async (
  params: OrganisationPollParams,
  {
    name,
    expectedNumberOfParticipants,
    defaultAdditionalQuestions,
    customAdditionalQuestions: updateCustomAdditionalQuestions,
    mode,
  }: OrganisationPollUpdateDto,
  user: NonNullable<Request['user']>,
  { session }: { session: Session }
) => {
  const {
    id,
    customAdditionalQuestions: existingCustomAdditionalQuestions,
    defaultAdditionalQuestions: existingDefaultAdditionalQuestions,
  } = await findOrganisationPollBySlugOrId(
    {
      params,
      user,
      select: {
        id: true,
        customAdditionalQuestions: true,
        defaultAdditionalQuestions: true,
      },
    },
    { session }
  )

  const customAdditionalQuestions =
    updateCustomAdditionalQuestions || existingCustomAdditionalQuestions

  const { organisation, ...poll } = await session.poll.update({
    where: { id },
    data: {
      name,
      expectedNumberOfParticipants,
      mode,
      ...(customAdditionalQuestions
        ? {
            customAdditionalQuestions,
          }
        : {}),
      ...(defaultAdditionalQuestions
        ? {
            defaultAdditionalQuestions: {
              ...(existingDefaultAdditionalQuestions.length
                ? {
                    deleteMany: {
                      id: {
                        in: existingDefaultAdditionalQuestions.map(
                          ({ id }) => id
                        ),
                      },
                    },
                  }
                : {}),
              ...(defaultAdditionalQuestions.length
                ? {
                    createMany: {
                      data: defaultAdditionalQuestions.map((type) => ({
                        type,
                      })),
                    },
                  }
                : {}),
            },
          }
        : {}),
    },
    select: {
      ...defaultPollSelection,
      organisation: {
        select: defaultOrganisationSelectionWithoutPolls,
      },
    },
  })

  const simulationsInfos = await fetchPollSimulationsInfo(
    {
      poll,
      user,
    },
    { session }
  )

  return {
    poll: sanitizePollComputedResults(poll),
    simulationsInfos,
    organisation,
  }
}

export const deleteOrganisationPoll = async (
  params: OrganisationPollParams,
  user: NonNullable<Request['user']>,
  { session }: { session: Session }
) => {
  return session.poll.delete({
    where: await findOrganisationPollBySlugOrId({ params, user }, { session }),
    select: {
      organisation: {
        select: defaultOrganisationSelectionWithoutPolls,
      },
    },
  })
}

export const fetchOrganisationPolls = async (
  params: OrganisationParams,
  user: NonNullable<Request['user']>,
  { session }: { session: Session }
) => {
  const organisation = await findOrganisationBySlugOrId(
    { params, user, select: defaultOrganisationSelectionWithoutPolls },
    { session: session }
  )
  const { polls } = await session.organisation.findUniqueOrThrow({
    where: {
      id: organisation.id,
    },
    select: {
      polls: {
        select: defaultPollSelection,
      },
    },
  })

  return {
    organisation,
    polls: await Promise.all(
      polls.map(async (poll) => ({
        poll: sanitizePollComputedResults(poll),
        simulationsInfos: await fetchPollSimulationsInfo(
          { poll, user },
          { session }
        ),
      }))
    ),
  }
}

export const fetchOrganisationPoll = async (
  params: OrganisationPollParams,
  user: NonNullable<Request['user']>,
  { session }: { session: Session }
) => {
  const { organisation, ...poll } = await findOrganisationPollBySlugOrId(
    {
      params,
      user,
      select: {
        ...defaultPollSelection,
        organisation: {
          select: defaultOrganisationSelectionWithoutPolls,
        },
      },
    },
    { session }
  )

  const simulationsInfos = await fetchPollSimulationsInfo(
    {
      poll,
      user,
    },
    { session }
  )

  return {
    simulationsInfos,
    organisation,
    poll: sanitizePollComputedResults(poll),
  }
}

export const fetchOrganisationPublicPoll = async (
  {
    pollIdOrSlug,
    userId,
    user,
  }: PublicPollParams & { user?: NonNullable<Request['user']> },
  { session }: { session: Session }
) => {
  const { organisation, ...poll } = await session.poll.findFirstOrThrow({
    where: {
      OR: [
        {
          id: pollIdOrSlug,
        },
        {
          slug: pollIdOrSlug,
        },
      ],
    },
    select: {
      ...defaultPollSelection,
      organisation: {
        select: defaultOrganisationSelectionWithoutPolls,
      },
    },
  })

  const simulationsInfos = await fetchPollSimulationsInfo(
    {
      poll,
      user: user || { userId },
    },
    { session }
  )

  return {
    poll: sanitizePollComputedResults(poll),
    simulationsInfos,
    organisation,
  }
}

export const findSimulationPoll = (
  { simulationId }: SimulationParams,
  { session }: { session: Session }
) => {
  return session.simulationPoll.findFirst({
    where: {
      simulationId,
    },
    select: {
      pollId: true,
      simulationId: true,
      updatedAt: true,
      poll: {
        select: {
          computeRealTimeStats: true,
        },
      },
    },
  })
}

export const setPollStats = (
  id: string,
  {
    computedResults,
    funFacts,
  }: { computedResults: ComputedResultSchema; funFacts: FunFacts },
  { session }: { session: Session }
) => {
  return session.poll.update({
    where: {
      id,
    },
    data: {
      computedResults,
      funFacts,
    },
    select: {
      id: true,
      funFacts: true,
      computedResults: true,
    },
  })
}

export type OrganisationsBatchBrevoStats = {
  organisationId: string
  organisationType: string | null
  administratorEmail: string | null
  lastPollParticipantsCount: number
  pollsCreatedCount: number
  organisationSimulationsCompletedCount: number
  organisationLastSimulationDate: Date | null
}

export const getOrganisationsBatchBrevoStats = ({
  session,
}: {
  session: Session
}): Promise<Array<OrganisationsBatchBrevoStats>> => {
  return session
    .$queryRaw<
      Array<{
        organisationId: string
        organisationType: string | null
        administratorEmail: string | null
        lastPollParticipantsCount: bigint
        pollsCreatedCount: bigint
        organisationSimulationsCompletedCount: bigint
        organisationLastSimulationDate: Date | null
      }>
    >(
      Prisma.sql`
      SELECT
        o.id as "organisationId",
        o.type as "organisationType",
        (
          SELECT vu.email FROM "ngc"."OrganisationAdministrator" oa
          JOIN "ngc"."VerifiedUser" vu ON vu.email = oa."userEmail"
          WHERE oa."organisationId" = o.id
          ORDER BY oa."createdAt" ASC
          LIMIT 1
        ) as "administratorEmail",
        COUNT(DISTINCT p.id) as "pollsCreatedCount",
        COUNT(DISTINCT sp."simulationId") FILTER (WHERE s.progression = 1) as "organisationSimulationsCompletedCount",
        MAX(s.date) FILTER (WHERE s.progression = 1) as "organisationLastSimulationDate",
        COALESCE((
          SELECT COUNT(*) FROM "ngc"."SimulationPoll" WHERE "pollId" = (
            SELECT p2.id FROM "ngc"."Poll" p2 WHERE p2."organisationId" = o.id ORDER BY p2."createdAt" DESC LIMIT 1
          )
        ), 0) as "lastPollParticipantsCount"
      FROM "ngc"."Organisation" o
      LEFT JOIN "ngc"."Poll" p ON p."organisationId" = o.id
      LEFT JOIN "ngc"."SimulationPoll" sp ON sp."pollId" = p.id
      LEFT JOIN "ngc"."Simulation" s ON s.id = sp."simulationId"
      GROUP BY o.id
    `
    )
    .then((rows) =>
      rows.map((row) => ({
        organisationId: row.organisationId,
        organisationType: row.organisationType,
        administratorEmail: row.administratorEmail,
        lastPollParticipantsCount: Number(row.lastPollParticipantsCount),
        pollsCreatedCount: Number(row.pollsCreatedCount),
        organisationSimulationsCompletedCount: Number(
          row.organisationSimulationsCompletedCount
        ),
        organisationLastSimulationDate: row.organisationLastSimulationDate,
      }))
    )
}
