import { faker } from '@faker-js/faker'
import { Factory } from 'fishery'
import { prisma } from '../../../prisma/client.ts'

class OrganisationFactory extends Factory<{
  id: string
  name: string
  slug: string
}> {}

export const organisationFactory = OrganisationFactory.define(
  ({ onCreate }) => {
    onCreate(async (data) => {
      await prisma.organisation.create({ data })
      return data
    })

    const name = faker.company.name()

    return {
      id: faker.string.uuid(),
      name,
      slug: faker.helpers.slugify(name).toLocaleLowerCase(),
    }
  }
)
