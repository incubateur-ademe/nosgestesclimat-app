import { faker } from '@faker-js/faker'
import { Factory } from 'fishery'
import { prisma } from '../../../prisma/client.ts'

class PollFactory extends Factory<{
  id: string
  name: string
  slug: string
  organisationId: string
  customAdditionalQuestions: object
  createdAt: Date
  updatedAt: Date
}> {}

export const pollFactory = PollFactory.define(({ onCreate }) => {
  onCreate(async (data) => {
    await prisma.poll.create({ data })
    return data
  })

  return {
    id: faker.string.uuid(),
    name: faker.company.name(),
    slug: `poll-${faker.string.uuid()}`,
    organisationId: faker.string.uuid(),
    customAdditionalQuestions: {},
    createdAt: new Date(),
    updatedAt: new Date(),
  }
})
