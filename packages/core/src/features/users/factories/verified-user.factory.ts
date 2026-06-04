import { faker } from '@faker-js/faker'
import { Factory } from 'fishery'
import { prisma } from '../../../prisma/client.ts'

class VerifiedUserFactory extends Factory<{
  email: string
  id: string
  name: string | null
  telephone: string | null
  position: string | null
  optedInForCommunications: boolean
  createdAt: Date
  updatedAt: Date
}> {}

export const verifiedUserFactory = VerifiedUserFactory.define(
  ({ onCreate }) => {
    onCreate(async (data) => {
      await prisma.verifiedUser.create({ data })
      return data
    })

    return {
      email: faker.internet.email().toLocaleLowerCase(),
      id: faker.string.uuid(),
      name: faker.person.fullName(),
      telephone: faker.phone.number(),
      position: faker.person.jobTitle(),
      optedInForCommunications: faker.datatype.boolean(),
      createdAt: faker.date.past(),
      updatedAt: faker.date.recent(),
    }
  }
)
