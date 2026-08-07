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

  return {
    id: faker.string.uuid(),
    slug: `${faker.internet.domainWord()}-${faker.string.alpha(4)}`,
    name: faker.company.name(),
    // The SEDD 2026 window is the fixture the whole events spec is built on:
    // tests create polls and simulations relative to these dates.
    startDate: new Date('2026-09-18T00:00:00Z'),
    endDate: new Date('2026-10-08T23:59:59Z'),
    createdAt: new Date(),
    updatedAt: new Date(),
  }
})
