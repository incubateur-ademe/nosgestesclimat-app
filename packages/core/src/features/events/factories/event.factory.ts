import { faker } from '@faker-js/faker'
import { Factory } from 'fishery'
import { prisma } from '../../../prisma/client.ts'

class EventFactory extends Factory<{
  id: string
  slug: string | null
  name: string
  startDate: Date
  endDate: Date
  createdAt: Date
  updatedAt: Date
}> {}

export const eventFactory = EventFactory.define(({ onCreate }) => {
  onCreate(async (data) => {
    await prisma.event.create({ data })
    return data
  })

  return {
    id: faker.string.uuid(),
    slug: null,
    name: 'SEDD 2026',
    startDate: new Date('2026-09-18T00:00:00Z'),
    endDate: new Date('2026-10-08T23:59:59Z'),
    createdAt: new Date(),
    updatedAt: new Date(),
  }
})
