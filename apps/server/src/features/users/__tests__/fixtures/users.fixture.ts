import { faker } from '@faker-js/faker'
import { StatusCodes } from 'http-status-codes'
import type supertest from 'supertest'
import { formatBrevoDate } from '../../../../adapters/brevo/__tests__/fixtures/formatBrevoDate.js'
import { brevoGetContact } from '../../../../adapters/brevo/__tests__/fixtures/server.fixture.js'
import type { BrevoContactDto } from '../../../../adapters/brevo/client.js'
import {
  mswServer,
  resetMswServer,
} from '../../../../core/__tests__/fixtures/server.fixture.js'
import { EventBus } from '../../../../core/event-bus/event-bus.js'
import type { UserUpdateDto } from '../../users.validator.js'

type TestAgent = ReturnType<typeof supertest>

export const UPDATE_USER_ROUTE = '/users/v1/:userId'

export const ME_ROUTE = '/users/v1/me'

export const getBrevoContact = (
  contact: Partial<BrevoContactDto> = {}
): BrevoContactDto => ({
  email: contact.email ?? faker.internet.email(),
  id: contact.id ?? faker.number.int(),
  emailBlacklisted: contact.emailBlacklisted ?? faker.datatype.boolean(),
  smsBlacklisted: contact.smsBlacklisted ?? faker.datatype.boolean(),
  createdAt: contact.createdAt ?? formatBrevoDate(faker.date.past()),
  modifiedAt: contact.modifiedAt ?? formatBrevoDate(faker.date.recent()),
  attributes: {
    ...contact.attributes,
    USER_ID: contact.attributes?.USER_ID ?? faker.string.uuid(),
    PRENOM: contact.attributes?.PRENOM ?? null,
  },
  listIds: contact.listIds ?? [],
  statistics: contact.statistics ?? {},
})

export const createUser = async ({
  agent,
  user: { id, name, email } = {},
}: {
  agent: TestAgent
  user?: Partial<UserUpdateDto> & { id?: string }
}) => {
  const userId = id || faker.string.uuid()
  let contact: BrevoContactDto | undefined

  if (email) {
    contact = getBrevoContact({
      email,
      attributes: {
        USER_ID: userId,
      },
    })

    mswServer.use(
      brevoGetContact(email, {
        customResponses: [
          {
            body: {
              code: 'document_not_found',
              message: 'Contact does not exist',
            },
            status: StatusCodes.NOT_FOUND,
          },
        ],
      })
    )
  }

  const response = await agent
    .put(UPDATE_USER_ROUTE.replace(':userId', userId))
    .send({ name, email })
    .expect(email ? StatusCodes.ACCEPTED : StatusCodes.OK)

  await EventBus.flush()

  resetMswServer()

  return {
    user: response.body,
    contact,
  }
}
