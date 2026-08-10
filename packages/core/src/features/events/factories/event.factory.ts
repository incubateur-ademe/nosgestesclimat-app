import { faker } from '@faker-js/faker'
import { Factory } from 'fishery'
import { prisma } from '../../../prisma/client.ts'
import type { Event } from '../../../prisma/generated/client.ts'

class EventFactory extends Factory<Event> {}

export const eventFactory = EventFactory.define(({ onCreate }) => {
  onCreate(async (data) => {
    await prisma.event.create({ data })
    return data
  })

  // An event that is active "now", so tests stay meaningful whatever date they
  // run on. Tests that need a specific window override these dates.
  const now = new Date()

  return {
    id: faker.string.uuid(),
    slug: `${faker.internet.domainWord()}-${faker.string.alpha(4)}`,
    name: faker.company.name(),
    startDate: new Date(now.getTime() - 24 * 60 * 60 * 1000),
    endDate: now,
    createdAt: now,
    updatedAt: now,
  }
})
