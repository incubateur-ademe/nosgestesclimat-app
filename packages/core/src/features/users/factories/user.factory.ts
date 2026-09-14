import { faker } from '@faker-js/faker'
import { Factory } from 'fishery'
import { prisma } from '../../../prisma/client.ts'
import type { AgeRange } from '../types/age-range.ts'
import { AgeRangeSchema } from '../types/age-range.ts'
import type { UnverifiedUser, VerifiedUser } from '../types/user.ts'

class UserFactory extends Factory<UnverifiedUser> {
  /** Returns a factory that persists a User with a linked VerifiedUser record. */
  verified() {
    return verifiedUserFactory
  }

  /** Explicit unverified (the default). Returns the factory itself. */
  unverified() {
    return this
  }
}

export const userFactory = UserFactory.define(({ onCreate }) => {
  onCreate(async (data) => {
    await prisma.user.create({
      data: {
        id: data.id,
        name: data.name,
        email: data.email,
        ageRange: data.ageRange,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      },
    })
    return data
  })

  return {
    type: 'unverified' as const,
    ...userBase(),
    email: null,
  }
})

const verifiedUserFactory = Factory.define<VerifiedUser>(({ onCreate }) => {
  onCreate(async (data) => {
    await prisma.user.create({
      data: {
        id: data.id,
        name: data.name,
        email: data.email,
        ageRange: data.ageRange,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      },
    })
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
    return data
  })

  return {
    type: 'verified' as const,
    ...userBase(),
    email: faker.internet.email().toLocaleLowerCase(),
    telephone: faker.helpers.maybe(() => faker.phone.number()) ?? null,
    position: faker.helpers.maybe(() => faker.person.jobTitle()) ?? null,
    optedInForCommunications: faker.datatype.boolean(),
  }
})

const userBase = () => {
  const ageRange = faker.helpers.arrayElement([
    ...AgeRangeSchema.options,
    null,
  ]) as AgeRange | null

  return {
    id: faker.string.uuid(),
    name: faker.helpers.maybe(() => faker.person.fullName()) ?? null,
    ageRange,
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
  }
}
