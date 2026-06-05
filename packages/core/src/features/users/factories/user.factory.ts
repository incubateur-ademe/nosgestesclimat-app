import { faker } from '@faker-js/faker'
import { Factory } from 'fishery'
import { prisma } from '../../../prisma/client.ts'
import type { AgeRange } from '../types/age-range.ts'
import { AgeRangeSchema } from '../types/age-range.ts'

class UserFactory extends Factory<{
  id: string
  name: string | null
  email: string | null
  ageRange: AgeRange | null
  createdAt: Date
  updatedAt: Date
}> {}

export const userFactory = UserFactory.define(({ onCreate }) => {
  onCreate(async (data) => {
    await prisma.user.create({ data })
    return data
  })

  return {
    id: faker.string.uuid(),
    name: faker.person.fullName(),
    email: faker.internet.email().toLocaleLowerCase(),
    ageRange: faker.helpers.arrayElement([
      ...AgeRangeSchema.options,
      null,
    ]) as AgeRange | null,
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
  }
})
