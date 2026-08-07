import { faker } from '@faker-js/faker'
import { Factory } from 'fishery'
import { prisma } from '../../../prisma/client.ts'
import type { Poll } from '../../../prisma/generated/client.ts'

class PollFactory extends Factory<Poll> {}

export const pollFactory = PollFactory.define(({ onCreate }) => {
  onCreate(async (data) => {
    await prisma.poll.create({
      data: {
        id: data.id,
        name: data.name,
        slug: data.slug,
        organisationId: data.organisationId,
        customAdditionalQuestions: {},
        mode: data.mode,
        computeRealTimeStats: data.computeRealTimeStats,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      },
    })
    return data
  })

  return {
    id: faker.string.uuid(),
    name: faker.company.name(),
    slug: `poll-${faker.string.uuid()}`,
    organisationId: faker.string.uuid(),
    funFacts: null,
    computedResults: null,
    expectedNumberOfParticipants: null,
    customAdditionalQuestions: {},
    mode: 'standard' as const,
    computeRealTimeStats: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  }
})
