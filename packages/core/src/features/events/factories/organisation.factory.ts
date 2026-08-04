import { faker } from '@faker-js/faker'
import { Factory } from 'fishery'
import { prisma } from '../../../prisma/client.ts'
import type { OrganisationType } from '../../../prisma/generated/enums.ts'

class OrganisationFactory extends Factory<{
  id: string
  name: string
  slug: string
  type: OrganisationType
  numberOfCollaborators: number | null
  createdAt: Date
  updatedAt: Date
}> {}

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
