import { faker } from '@faker-js/faker'
import { prisma } from '@nosgestesclimat/core/prisma/client'
import { StatusCodes } from 'http-status-codes'
import type supertest from 'supertest'
import {
  brevoSendEmail,
  brevoUpdateContact,
} from '../../../../adapters/brevo/__tests__/fixtures/server.fixture.ts'
import { authHeaders } from '../../../../core/__tests__/fixtures/authentication.fixture.ts'
import {
  mswServer,
  resetMswServer,
} from '../../../../core/__tests__/fixtures/server.fixture.ts'
import { EventBus } from '../../../../core/event-bus/event-bus.ts'
import { getSimulationPayload } from '../../../simulations/__tests__/fixtures/simulations.fixtures.ts'
import type {
  GroupCreateInputDto,
  ParticipantInputCreateDto,
} from '../../groups.validator.ts'

type TestAgent = ReturnType<typeof supertest>

export const CREATE_GROUP_ROUTE = '/groups/v1'

export const UPDATE_USER_GROUP_ROUTE = '/groups/v1/:userId/:groupId'

export const CREATE_PARTICIPANT_ROUTE = '/groups/v1/:groupId/participants'

export const DELETE_PARTICIPANT_ROUTE =
  '/groups/v1/:userId/:groupId/participants/:participantId'

export const FETCH_USER_GROUPS_ROUTE = '/groups/v1/:userId'

export const FETCH_USER_GROUP_ROUTE = '/groups/v1/:userId/:groupId'

export const DELETE_USER_GROUP_ROUTE = '/groups/v1/:groupId'

export const createGroup = async ({
  agent,
  group: { administrator, participants, emoji, name } = {},
}: {
  agent: TestAgent
  group?: {
    administrator?: { userId?: string; email?: string; name?: string }
    participants?: GroupCreateInputDto['participants']
    emoji?: string
    name?: string
  }
}) => {
  const userId = administrator?.userId || faker.string.uuid()
  const { email } = administrator || {}

  const payload: GroupCreateInputDto = {
    emoji: emoji || faker.internet.emoji(),
    name: name || faker.company.name(),
    administrator: {
      name: administrator?.name || faker.person.fullName(),
    },
    participants,
  }

  if (email && participants?.length) {
    mswServer.use(brevoSendEmail(), brevoUpdateContact())
  }

  const response = await agent
    .post(CREATE_GROUP_ROUTE)
    .set(authHeaders({ userId, email }))
    .send(payload)
    .expect(StatusCodes.CREATED)

  await EventBus.flush()

  resetMswServer()

  return response.body
}

export const joinGroup = async ({
  agent,
  participant: { userId, email, name, simulation } = {},
  groupId,
}: {
  agent: TestAgent
  participant?: Partial<ParticipantInputCreateDto> & {
    userId?: string
    email?: string
  }
  groupId: string
}) => {
  const participantUserId = userId || faker.string.uuid()

  const payload: ParticipantInputCreateDto = {
    name: name || faker.person.fullName(),
    simulation: simulation || getSimulationPayload(),
  }

  const [existingUser, group, existingParticipant] = await Promise.all([
    prisma.user.findFirst({
      where: {
        id: participantUserId,
      },
      select: {
        email: true,
      },
    }),
    prisma.group.findUniqueOrThrow({
      where: {
        id: groupId,
      },
      select: {
        administrator: {
          select: {
            user: {
              select: {
                id: true,
                email: true,
              },
            },
          },
        },
        participants: {
          select: {
            user: {
              select: {
                id: true,
              },
            },
          },
        },
      },
    }),
    ...(email
      ? [
          prisma.groupParticipant.findFirst({
            where: {
              user: {
                email,
              },
            },
            select: {
              id: true,
            },
          }),
        ]
      : []),
  ])

  if (email || existingUser?.email) {
    if (!existingParticipant) {
      mswServer.use(brevoSendEmail())
    }
  }

  const administrator = group.administrator?.user
  const participants = group.participants

  if (
    email ||
    existingUser?.email ||
    (administrator?.email &&
      participants.some(({ user }) => user.id === administrator.id))
  ) {
    mswServer.use(brevoUpdateContact())
  }

  const response = await agent
    .post(CREATE_PARTICIPANT_ROUTE.replace(':groupId', groupId))
    .set(authHeaders({ userId: participantUserId, email }))
    .send(payload)
    .expect(StatusCodes.CREATED)

  await EventBus.flush()

  resetMswServer()

  return response.body
}
