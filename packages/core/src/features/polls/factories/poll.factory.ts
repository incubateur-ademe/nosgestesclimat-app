import { faker } from '@faker-js/faker'
import type { DeepPartial, GeneratorFn } from 'fishery'
import { Factory } from 'fishery'
import { prisma } from '../../../prisma/client.ts'
import type { Poll } from '../../../prisma/generated/client.ts'
import { organisationFactory } from '../../organisations/factories/organisation.factory.ts'

export class PollFactory extends Factory<Poll, unknown, Poll> {}

export const pollGenerator: GeneratorFn<
  Poll,
  unknown,
  Poll,
  DeepPartial<Poll>
> = ({ onCreate }) => {
  onCreate(async (data) => {
    // An empty `organisationId` signals "not provided": the required parent
    // organisation is created on the fly. Passing an explicit id (e.g. to
    // share an organisation across polls) keeps that one instead.
    const organisationId =
      data.organisationId || (await organisationFactory.create()).id
    await prisma.poll.create({
      data: {
        id: data.id,
        name: data.name,
        slug: data.slug,
        organisationId,
        customAdditionalQuestions: {},
        mode: data.mode,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      },
    })
    return { ...data, organisationId }
  })

  return {
    id: faker.string.uuid(),
    name: faker.company.name(),
    slug: `poll-${faker.string.uuid()}`,
    organisationId: '',
    funFacts: null,
    computedResults: null,
    expectedNumberOfParticipants: null,
    customAdditionalQuestions: {},
    mode: 'standard' as const,
    createdAt: new Date(),
    updatedAt: new Date(),
  }
}

export const pollFactory = PollFactory.define(pollGenerator)
