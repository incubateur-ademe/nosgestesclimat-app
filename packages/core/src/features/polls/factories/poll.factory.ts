import { faker } from '@faker-js/faker'
import { Factory } from 'fishery'
import { prisma } from '../../../prisma/client.ts'
import { Prisma } from '../../../prisma/generated/client.ts'
import type { ComputedResults } from '../../simulations/validators/computed-results.schema.ts'
import type { Poll } from '../types/poll.ts'

interface PollTransientParams {
  organisationId: string
}

class PollFactory extends Factory<Poll, PollTransientParams, Poll> {
  withOrganisation(organisationId: string) {
    return this.transient({ organisationId })
  }

  scolaire() {
    return this.params({ mode: 'scolaire' })
  }

  /** computedResults predating the current carbone/eau shape */
  withDeprecatedComputedResults() {
    return this.params({
      computedResults: { bilan: 1000 } as unknown as ComputedResults,
    })
  }
}

export const pollFactory = PollFactory.define(
  ({ onCreate, transientParams }) => {
    const organisationId = transientParams.organisationId ?? faker.string.uuid()

    onCreate(async (data) => {
      await prisma.poll.create({
        data: {
          id: data.id,
          name: data.name,
          slug: data.slug,
          mode: data.mode,
          organisationId,
          expectedNumberOfParticipants: data.expectedNumberOfParticipants,
          funFacts:
            (data.funFacts as Prisma.InputJsonValue | null) ?? Prisma.DbNull,
          computedResults:
            (data.computedResults as unknown as Prisma.InputJsonValue | null) ??
            Prisma.DbNull,
          customAdditionalQuestions:
            data.customAdditionalQuestions as Prisma.InputJsonValue,
          defaultAdditionalQuestions: {
            create: data.defaultAdditionalQuestions.map((type) => ({ type })),
          },
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        },
      })
      return data
    })

    const name = faker.company.buzzPhrase()

    return {
      id: faker.string.uuid(),
      name,
      slug: `${faker.helpers.slugify(name).toLocaleLowerCase()}-${faker.string.alphanumeric(6)}`,
      mode: 'standard' as const,
      expectedNumberOfParticipants: null,
      funFacts: null,
      computedResults: null,
      customAdditionalQuestions: [],
      defaultAdditionalQuestions: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      organisation: {
        id: organisationId,
        name: '',
        slug: '',
      },
    }
  }
)
