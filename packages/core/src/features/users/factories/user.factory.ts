import { faker } from '@faker-js/faker'
import { Factory } from 'fishery'
import { prisma } from '../../../prisma/client.ts'
import type { UnverifiedUser, User, VerifiedUser } from '../types/user.ts'

/** Written by sessions rather than at registration: a test sets it to place an
 * account on the activity clock. */
type WithLastActivity = { lastActivityAt: Date | null }

/** Set by the erasure rather than at registration: a test sets it to start from
 * an erased account. */
type WithDeletedAt = { deletedAt: Date | null }

type UserAttributes = User & WithLastActivity & WithDeletedAt

/** Persists the aggregate: the user row, and the verified record when the
 * variant is verified. */
const persistUser = async <Attributes extends UserAttributes>(
  data: Attributes
): Promise<Attributes> => {
  await prisma.user.create({
    data: {
      id: data.id,
      name: data.name,
      email: data.email,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      lastActivityAt: data.lastActivityAt,
      deletedAt: data.deletedAt,
    },
  })

  if (data.type === 'verified') {
    await prisma.verifiedUser.create({
      data: {
        email: data.email,
        id: data.id,
        name: data.name,
        telephone: data.telephone,
        position: data.position,
        optedInForCommunications: data.optedInForCommunications,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      },
    })
  }

  return data
}

/** The attributes of an account carrying an erasure date. */
const erasedAttributes = () => ({ deletedAt: new Date(), name: null })

class UserFactory extends Factory<
  UnverifiedUser & WithLastActivity & WithDeletedAt
> {
  /** Returns a factory that persists a User with a linked VerifiedUser record. */
  verified() {
    return verifiedUserFactory
  }

  /** Explicit unverified (the default). Returns the factory itself. */
  unverified() {
    return this
  }

  /** Returns a factory that persists an erased account. */
  erased() {
    return this.params(erasedAttributes())
  }
}

export const userFactory = UserFactory.define(({ onCreate }) => {
  onCreate(persistUser)

  return {
    type: 'unverified' as const,
    ...userBase(),
    email: null,
  }
})

class VerifiedUserFactory extends Factory<
  VerifiedUser & WithLastActivity & WithDeletedAt
> {
  /** Returns a factory that persists a verified account carrying an erasure
   * date: the pair only survives an interrupted erasure. */
  erased() {
    return this.params(erasedAttributes())
  }
}

const verifiedUserFactory = VerifiedUserFactory.define(({ onCreate }) => {
  onCreate(persistUser)

  return {
    type: 'verified' as const,
    ...userBase(),
    email: faker.internet.email().toLocaleLowerCase(),
    telephone: faker.helpers.maybe(() => faker.phone.number()) ?? null,
    position: faker.helpers.maybe(() => faker.person.jobTitle()) ?? null,
    optedInForCommunications: faker.datatype.boolean(),
  }
})

const userBase = () => ({
  id: faker.string.uuid(),
  name: faker.helpers.maybe(() => faker.person.fullName()) ?? null,
  createdAt: faker.date.past(),
  updatedAt: faker.date.recent(),
  lastActivityAt: null as Date | null,
  deletedAt: null as Date | null,
})
