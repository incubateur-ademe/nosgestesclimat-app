import { faker } from '@faker-js/faker'
import { Factory } from 'fishery'
import { prisma } from '../../../prisma/client.ts'
import type { Organisation } from '../../../prisma/generated/client.ts'

class OrganisationFactory extends Factory<Organisation> {}

export const organisationFactory = OrganisationFactory.define(({ onCreate }) => {
  onCreate(async (data) => {
    await prisma.organisation.create({ data })
    return data
  })

  return {
    id: faker.string.uuid(),
    name: faker.company.name(),
    slug: `${faker.internet.domainWord()}-${faker.string.alphanumeric(6)}`,
    type: 'company' as const,
    numberOfCollaborators: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  }
})
