import { afterEach, describe, expect, it } from 'vitest'
import { prisma } from '../../../../prisma/client.ts'
import type { OrganisationType } from '../../../../prisma/generated/enums.ts'
import { getEventInfo } from '../get-event-info.service.ts'

/** Refresh the materialized view so it reflects newly inserted test data. */
const refreshMV = () =>
  prisma.$executeRawUnsafe(
    'REFRESH MATERIALIZED VIEW "ngc"."event_computation"'
  )

// Create the minimum viable Simulation.
const createSimulation = (
  data: { createdAt?: Date; progression?: number } = {}
) =>
  prisma.simulation.create({
    data: {
      date: data.createdAt ?? new Date(),
      progression: data.progression ?? 1,
      computedResults: {},
      actionChoices: {},
      situation: {},
      createdAt: data.createdAt,
    },
  })

const createOrganisation = (data: {
  name: string
  slug: string
  type?: OrganisationType
}) =>
  prisma.organisation.create({
    data: { ...data, type: data.type ?? 'company' },
  })

const seedPoll = async (
  event: { startDate: Date; endDate: Date },
  organisationId: string,
  simulationCount: number
) => {
  const poll = await prisma.poll.create({
    data: {
      name: `Poll ${organisationId}`,
      slug: `poll-${organisationId}`,
      organisationId,
      customAdditionalQuestions: {},
      createdAt: new Date(
        event.startDate.getTime() +
          (event.endDate.getTime() - event.startDate.getTime()) / 2
      ),
    },
  })

  for (let i = 0; i < simulationCount; i++) {
    const sim = await createSimulation({
      createdAt: new Date(
        poll.createdAt.getTime() + i * 1_000 // 1s apart to avoid duplicates
      ),
    })
    await prisma.simulationPoll.create({
      data: { pollId: poll.id, simulationId: sim.id },
    })
  }
}

describe('getEventInfo', () => {
  afterEach(async () => {
    await prisma.simulationPoll.deleteMany()
    await prisma.simulation.deleteMany()
    await prisma.poll.deleteMany()
    await prisma.organisation.deleteMany()
    await prisma.event.deleteMany()
    await refreshMV()
  })

  it('returns empty data when event does not exist', async () => {
    const result = await getEventInfo('non-existent-id')

    expect(result).toEqual({
      organisations: [],
      totalSimulations: 0,
      organisationCount: 0,
    })
  })

  it('returns zeroes when event has no polls and no simulations', async () => {
    const event = await prisma.event.create({
      data: {
        name: 'Empty Event',
        startDate: new Date('2026-09-18T00:00:00Z'),
        endDate: new Date('2026-10-08T23:59:59Z'),
      },
    })

    const result = await getEventInfo(event.id)

    expect(result).toEqual({
      organisations: [],
      totalSimulations: 0,
      organisationCount: 0,
    })
  })

  it('returns totalSimulations even when event has no polls', async () => {
    const event = await prisma.event.create({
      data: {
        name: 'No Poll Event',
        startDate: new Date('2026-09-18T00:00:00Z'),
        endDate: new Date('2026-10-08T23:59:59Z'),
      },
    })

    // Simulation in the date range, but no poll — should still be counted
    await createSimulation({ createdAt: new Date('2026-09-25T12:00:00Z') })

    const result = await getEventInfo(event.id)

    expect(result.organisations).toEqual([])
    expect(result.totalSimulations).toBe(1)
    expect(result.organisationCount).toBe(0)
  })

  it('returns organisation with correct fields and simulationsCount', async () => {
    const event = await prisma.event.create({
      data: {
        name: 'SEDD 2026',
        startDate: new Date('2026-09-18T00:00:00Z'),
        endDate: new Date('2026-10-08T23:59:59Z'),
      },
    })

    const org = await createOrganisation({
      name: 'Org Alpha',
      slug: 'org-alpha',
      type: 'company',
    })

    await seedPoll(event, org.id, 3)
    await refreshMV()

    const result = await getEventInfo(event.id)

    expect(result.organisations).toHaveLength(1)
    expect(result.organisations[0]).toEqual({
      id: org.id,
      name: 'Org Alpha',
      slug: 'org-alpha',
      type: 'company',
      simulationsCount: 3,
    })
    expect(result.totalSimulations).toBe(3)
    expect(result.organisationCount).toBe(1)
  })

  it('returns organisations ordered by simulationsCount DESC', async () => {
    const event = await prisma.event.create({
      data: {
        name: 'SEDD 2026',
        startDate: new Date('2026-09-18T00:00:00Z'),
        endDate: new Date('2026-10-08T23:59:59Z'),
      },
    })

    const [orgA, orgB, orgC] = await Promise.all([
      createOrganisation({ name: 'A', slug: 'a' }),
      createOrganisation({ name: 'B', slug: 'b' }),
      createOrganisation({ name: 'C', slug: 'c' }),
    ])

    await Promise.all([
      seedPoll(event, orgA.id, 1),
      seedPoll(event, orgB.id, 3),
      seedPoll(event, orgC.id, 2),
    ])

    await refreshMV()

    const result = await getEventInfo(event.id)

    expect(result.organisations).toHaveLength(3)
    expect(result.organisations.map((o) => o.slug)).toEqual(['b', 'c', 'a'])
  })

  it('excludes organisations with zero simulations from organisationCount', async () => {
    const event = await prisma.event.create({
      data: {
        name: 'SEDD 2026',
        startDate: new Date('2026-09-18T00:00:00Z'),
        endDate: new Date('2026-10-08T23:59:59Z'),
      },
    })

    const orgWithSims = await createOrganisation({
      name: 'With Sims',
      slug: 'with-sims',
    })
    const orgWithoutSims = await createOrganisation({
      name: 'No Sims',
      slug: 'no-sims',
    })

    await seedPoll(event, orgWithSims.id, 1)
    await seedPoll(event, orgWithoutSims.id, 0)

    await refreshMV()

    const result = await getEventInfo(event.id)

    expect(result.organisationCount).toBe(1)
  })

  it('excludes ademe-SEDD organisation from both list and count', async () => {
    const event = await prisma.event.create({
      data: {
        name: 'SEDD 2026',
        startDate: new Date('2026-09-18T00:00:00Z'),
        endDate: new Date('2026-10-08T23:59:59Z'),
      },
    })

    const seddOrg = await createOrganisation({
      name: 'ADEME SEDD',
      slug: 'ademe-SEDD',
    })
    const otherOrg = await createOrganisation({
      name: 'Other',
      slug: 'other',
    })

    await Promise.all([
      seedPoll(event, seddOrg.id, 5),
      seedPoll(event, otherOrg.id, 3),
    ])

    await refreshMV()

    const result = await getEventInfo(event.id)

    // The ademe-SEDD org has 5 simulations but must not appear in the list
    expect(result.organisations.map((o) => o.slug)).toEqual(['other'])
    expect(result.organisationCount).toBe(1)
  })

  it('still counts ademe-SEDD simulations in totalSimulations', async () => {
    const event = await prisma.event.create({
      data: {
        name: 'SEDD 2026',
        startDate: new Date('2026-09-18T00:00:00Z'),
        endDate: new Date('2026-10-08T23:59:59Z'),
      },
    })

    const seddOrg = await createOrganisation({
      name: 'ADEME SEDD',
      slug: 'ademe-SEDD',
    })
    const otherOrg = await createOrganisation({
      name: 'Other',
      slug: 'other',
    })

    await Promise.all([
      seedPoll(event, seddOrg.id, 5),
      seedPoll(event, otherOrg.id, 2),
    ])

    await refreshMV()

    const result = await getEventInfo(event.id)

    // totalSimulations comes from Simulation table (7 sims total) — includes everyone
    expect(result.totalSimulations).toBe(7)
  })

  it('includes simulation exactly at startDate in totalSimulations', async () => {
    const event = await prisma.event.create({
      data: {
        name: 'Boundary Event',
        startDate: new Date('2026-09-18T00:00:00Z'),
        endDate: new Date('2026-10-08T23:59:59Z'),
      },
    })

    await createSimulation({ createdAt: new Date('2026-09-18T00:00:00Z') })

    const result = await getEventInfo(event.id)

    expect(result.totalSimulations).toBe(1)
  })

  it('includes simulation exactly at endDate in totalSimulations', async () => {
    const event = await prisma.event.create({
      data: {
        name: 'Boundary Event',
        startDate: new Date('2026-09-18T00:00:00Z'),
        endDate: new Date('2026-10-08T23:59:59Z'),
      },
    })

    await createSimulation({ createdAt: new Date('2026-10-08T23:59:59Z') })

    const result = await getEventInfo(event.id)

    expect(result.totalSimulations).toBe(1)
  })

  it('excludes simulation outside date range from totalSimulations', async () => {
    const event = await prisma.event.create({
      data: {
        name: 'Boundary Event',
        startDate: new Date('2026-09-18T00:00:00Z'),
        endDate: new Date('2026-10-08T23:59:59Z'),
      },
    })

    await createSimulation({ createdAt: new Date('2026-09-17T23:59:59Z') }) // 1s before
    await createSimulation({ createdAt: new Date('2026-10-09T00:00:00Z') }) // 1s after

    const result = await getEventInfo(event.id)

    expect(result.totalSimulations).toBe(0)
  })

  it('organisationCount is not capped by LIMIT 15', async () => {
    const event = await prisma.event.create({
      data: {
        name: 'SEDD 2026',
        startDate: new Date('2026-09-18T00:00:00Z'),
        endDate: new Date('2026-10-08T23:59:59Z'),
      },
    })

    const ORG_COUNT = 20

    const orgs = await Promise.all(
      Array.from({ length: ORG_COUNT }, (_, i) =>
        createOrganisation({ name: `Org ${i}`, slug: `org-${i}` })
      )
    )

    await Promise.all(orgs.map((org) => seedPoll(event, org.id, 1)))
    await refreshMV()

    const result = await getEventInfo(event.id)

    expect(result.organisations).toHaveLength(15)
    expect(result.organisationCount).toBe(ORG_COUNT)
  })
})
