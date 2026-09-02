import { faker } from '@faker-js/faker'
import { Factory } from 'fishery'
import { prisma } from '../../../prisma/client.ts'
import { Prisma } from '../../../prisma/generated/client.ts'
import type { ComputedResults } from '../../simulations/validators/computed-results.schema.ts'
import type { Poll } from '../types/poll.ts'
import { organisationFactory } from './organisation.factory.ts'

interface PollTransientParams {
  organisationId: string
}

class PollFactory extends Factory<Poll, PollTransientParams, Poll> {
  scolaire() {
    return this.params({ mode: 'scolaire' })
  }

  /** computedResults predating the current carbone/eau shape */
  withDeprecatedComputedResults() {
    return this.params({
      computedResults: { bilan: 1000 } as unknown as ComputedResults,
    })
  }

  withStatsComputationStatus(
    status: 'completed' | 'pending' | 'processing' | 'failed',
    { scheduledAt, startedAt }: { scheduledAt?: Date; startedAt?: Date } = {}
  ) {
    return this.afterCreate(async (poll) => {
      await prisma.pollStatsComputation.create({
        data: { pollId: poll.id, status, scheduledAt, startedAt },
      })
      return poll
    })
  }

  withPendingComputation(scheduledAt: Date) {
    return this.withStatsComputationStatus('pending', { scheduledAt })
  }

  withCompletedComputation() {
    return this.withStatsComputationStatus('completed')
  }

  withFailedComputation() {
    return this.withStatsComputationStatus('failed')
  }

  withProcessingComputation(startedAt: Date = new Date()) {
    return this.withStatsComputationStatus('processing', { startedAt })
  }

  withStaleProcessingComputation() {
    return this.withProcessingComputation(new Date(Date.now() - 60 * 60 * 1000))
  }
}

export const pollFactory = PollFactory.define(
  ({ onCreate, transientParams: { organisationId } }) => {
    onCreate(async (data) => {
      // a poll cannot exist without an organisation: create one unless the
      // caller pointed the poll at an existing organisation
      const organisation = organisationId
        ? data.organisation
        : await organisationFactory.create({ id: data.organisation.id })

      await prisma.poll.create({
        data: {
          id: data.id,
          name: data.name,
          slug: data.slug,
          mode: data.mode,
          organisationId: organisation.id,
          expectedNumberOfParticipants: data.expectedNumberOfParticipants,
          funFacts:
            (data.funFacts as Prisma.InputJsonValue | null) ?? Prisma.DbNull,
          computedResults:
            (data.computedResults as unknown as Prisma.InputJsonValue | null) ??
            Prisma.DbNull,
          // no longer exposed on the Poll model but the column is required
          customAdditionalQuestions: {},
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        },
      })

      return {
        ...data,
        organisation: {
          id: organisation.id,
          name: organisation.name,
          slug: organisation.slug,
        },
      }
    })

    const name = faker.company.buzzPhrase()

    return {
      // polls are created with `@default(cuid())` in production: keep the same
      // shape so that id/slug resolution behaves like it does there
      id: `c${faker.string.alphanumeric({ length: 24, casing: 'lower' })}`,
      name,
      slug: `${faker.helpers.slugify(name).toLocaleLowerCase()}-${faker.string.alphanumeric(6)}`,
      mode: 'standard' as const,
      expectedNumberOfParticipants: null,
      funFacts: null,
      computedResults: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      organisation: {
        id: organisationId ?? faker.string.uuid(),
        name: '',
        slug: '',
      },
    }
  }
)
