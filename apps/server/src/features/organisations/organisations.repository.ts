import type { FunFacts } from '@incubateur-ademe/nosgestesclimat'
import type { Request } from 'express'
import slugify from 'slugify'
import type { Prisma, JsonValue } from '../../adapters/prisma/generated.js'
import {
  defaultOrganisationSelection,
  defaultOrganisationSelectionWithoutPolls,
  defaultPollSelection,
  defaultVerifiedUserSelection,
} from '../../adapters/prisma/selection.js'
import type { Session } from '../../adapters/prisma/transaction.js'
import type { PaginationQuery } from '../../core/pagination.js'
import type { SimulationParams } from '../simulations/simulations.validator.js'
import { ComputedResultSchema } from '../simulations/simulations.validator.js'
import type {
  OrganisationCreateDto,
  OrganisationParams,
  OrganisationPollCreateDto,
  OrganisationPollParams,
  OrganisationPollUpdateDto,
  OrganisationUpdateDto,
  PollParams,
  PublicPollParams,
} from './organisations.validator.js'

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

export const getLastPollParticipantsCount = async (
  organisationId: string,
  { session }: { session: Session }
) => {
  /**
   * Prisma does not handle the greatest-n-per-group
   * https://github.com/prisma/prisma/discussions/17994
   *
   * We could replace it with
   *   const [{ count }] = await prisma.$queryRaw<[{ count: bigint }]>(
   * Prisma.sql`
   *   Select count(id) from "SimulationPoll" where "pollId" in
   *   (Select p1.id from "Poll" p1 left outer join "Poll" p2 on p1."organisationId" = p2."organisationId"
   *   and (p1."createdAt" < p2."createdAt" or (p1."createdAt" = p2."createdAt" and p1.id < p2.id))
   *   where p1."organisationId" = ${organisationId} and p2.id is null)
   * `)
   *
   * But less readable
   */

  let count = 0
  const poll = await session.poll.findFirst({
    where: {
      organisationId,
    },
    orderBy: {
      createdAt: 'desc',
    },
    select: {
      id: true,
    },
  })

  if (poll) {
    count = await session.simulationPoll.count({
      where: {
        pollId: poll.id,
      },
    })
  }

  return count
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
