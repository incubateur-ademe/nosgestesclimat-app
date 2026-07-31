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

const createEvent = (
  startDate = '2026-09-18T00:00:00Z',
  endDate = '2026-10-08T23:59:59Z'
) =>
  prisma.event.create({
    data: {
      name: 'SEDD 2026',
      startDate: new Date(startDate),
      endDate: new Date(endDate),
    },
  })

const seedPoll = async (
  event: { startDate: Date; endDate: Date },
  organisationId: string,
  simulationCount: number,
  options: {
    pollCreatedAt?: Date
    simulationProgression?: number
    simulationDates?: Date[]
  } = {}
) => {
  const poll = await prisma.poll.create({
    data: {
      name: `Poll ${organisationId}`,
      slug: `poll-${organisationId}-${Math.random().toString(36).slice(2, 8)}`,
      organisationId,
      customAdditionalQuestions: {},
      createdAt:
        options.pollCreatedAt ??
        new Date(
          event.startDate.getTime() +
            (event.endDate.getTime() - event.startDate.getTime()) / 2
        ),
    },
  })

  const simulationCreatedAt = (i: number) =>
    options.simulationDates?.[i] ??
    new Date(poll.createdAt.getTime() + i * 1_000) // 1s apart to avoid duplicates

  for (let i = 0; i < simulationCount; i++) {
    const sim = await createSimulation({
      createdAt: simulationCreatedAt(i),
      progression: options.simulationProgression,
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
      startDate: null,
      endDate: null,
    })
  })

  it('resolves the event by slug', async () => {
    const event = await prisma.event.create({
      data: {
        name: 'SEDD 2026',
        slug: 'sedd',
        startDate: new Date('2026-09-18T00:00:00Z'),
        endDate: new Date('2026-10-08T23:59:59Z'),
      },
    })

    const result = await getEventInfo('sedd')

    expect(result.startDate?.toISOString()).toBe('2026-09-18T00:00:00.000Z')
    expect(result.endDate?.toISOString()).toBe('2026-10-08T23:59:59.000Z')
    expect(event.id).toBeTruthy()
  })

  it('returns zeroes when event has no polls and no simulations', async () => {
    const event = await createEvent()

    const result = await getEventInfo(event.id)

    expect(result).toEqual({
      organisations: [],
      totalSimulations: 0,
      organisationCount: 0,
      startDate: event.startDate,
      endDate: event.endDate,
    })
  })

  it('returns totalSimulations even when event has no polls', async () => {
    const event = await createEvent()

    // Simulation in the date range, but no poll — should still be counted
    await createSimulation({ createdAt: new Date('2026-09-25T12:00:00Z') })
    await refreshMV()

    const result = await getEventInfo(event.id)

    expect(result.organisations).toEqual([])
    expect(result.totalSimulations).toBe(1)
    expect(result.organisationCount).toBe(0)
  })

  it('returns organisation with correct fields and simulationsCount', async () => {
    const event = await createEvent()

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
    const event = await createEvent()

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

  it('counts only organisations with at least 2 simulations as mobilised', async () => {
    const event = await createEvent()

    const orgWithOneSim = await createOrganisation({
      name: 'One Sim',
      slug: 'one-sim',
    })
    const orgWithTwoSims = await createOrganisation({
      name: 'Two Sims',
      slug: 'two-sims',
    })

    await seedPoll(event, orgWithOneSim.id, 1)
    await seedPoll(event, orgWithTwoSims.id, 2)

    await refreshMV()

    const result = await getEventInfo(event.id)

    // 1 simulation is not enough to be counted as "mobilised" (>= 2 required)
    expect(result.organisationCount).toBe(1)
  })

  it('counts simulations from old polls created before the event window (Exemple 1)', async () => {
    const event = await createEvent()

    const oldOrg = await createOrganisation({
      name: 'Old Org',
      slug: 'old-org',
    })

    // The poll was created in June 2026, before the event window,
    // but the simulations are done during the event window.
    await seedPoll(event, oldOrg.id, 2, {
      pollCreatedAt: new Date('2026-06-10T00:00:00Z'),
      simulationDates: [
        new Date('2026-09-20T10:00:00Z'),
        new Date('2026-09-21T10:00:00Z'),
      ],
    })

    await refreshMV()

    const result = await getEventInfo(event.id)

    expect(result.organisations).toHaveLength(1)
    expect(result.organisations[0].slug).toBe('old-org')
    expect(result.organisations[0].simulationsCount).toBe(2)
    expect(result.totalSimulations).toBe(2)
    expect(result.organisationCount).toBe(1)
  })

  it('does not count incomplete simulations (progression < 1)', async () => {
    const event = await createEvent()

    const org = await createOrganisation({
      name: 'Org',
      slug: 'org',
    })

    // 1 completed + 1 in progress (progression = 0.5)
    await seedPoll(event, org.id, 1)
    await seedPoll(event, org.id, 1, { simulationProgression: 0.5 })

    await refreshMV()

    const result = await getEventInfo(event.id)

    expect(result.organisations[0].simulationsCount).toBe(1)
    expect(result.totalSimulations).toBe(1)
  })

  it('excludes ademe-sedd organisation from both list and count', async () => {
    const event = await createEvent()

    const seddOrg = await createOrganisation({
      name: 'ADEME SEDD',
      slug: 'ademe-sedd',
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

    // The ademe-sedd org has 5 simulations but must not appear in the list
    expect(result.organisations.map((o) => o.slug)).toEqual(['other'])
    expect(result.organisationCount).toBe(1)
  })

  it('still counts ademe-sedd simulations in totalSimulations', async () => {
    const event = await createEvent()

    const seddOrg = await createOrganisation({
      name: 'ADEME SEDD',
      slug: 'ademe-sedd',
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

    // totalSimulations counts every completed simulation in the window, ADEME included
    expect(result.totalSimulations).toBe(7)
  })

  it('includes simulation exactly at startDate in totalSimulations', async () => {
    const event = await createEvent()

    await createSimulation({ createdAt: new Date('2026-09-18T00:00:00Z') })
    await refreshMV()

    const result = await getEventInfo(event.id)

    expect(result.totalSimulations).toBe(1)
  })

  it('includes simulation exactly at endDate in totalSimulations', async () => {
    const event = await createEvent()

    await createSimulation({ createdAt: new Date('2026-10-08T23:59:59Z') })
    await refreshMV()

    const result = await getEventInfo(event.id)

    expect(result.totalSimulations).toBe(1)
  })

  it('excludes simulation outside date range from totalSimulations', async () => {
    const event = await createEvent()

    await createSimulation({ createdAt: new Date('2026-09-17T23:59:59Z') }) // 1s before
    await createSimulation({ createdAt: new Date('2026-10-09T00:00:00Z') }) // 1s after
    await refreshMV()

    const result = await getEventInfo(event.id)

    expect(result.totalSimulations).toBe(0)
  })

  it('caps the podium at 15 per organisation type', async () => {
    const event = await createEvent()

    const ORGS_PER_TYPE = 20

    const companyOrgs = await Promise.all(
      Array.from({ length: ORGS_PER_TYPE }, (_, i) =>
        createOrganisation({
          name: `Company ${i}`,
          slug: `company-${i}`,
          type: 'company',
        })
      )
    )
    const associationOrgs = await Promise.all(
      Array.from({ length: ORGS_PER_TYPE }, (_, i) =>
        createOrganisation({
          name: `Association ${i}`,
          slug: `association-${i}`,
          type: 'association',
        })
      )
    )

    await Promise.all([
      ...companyOrgs.map((org) => seedPoll(event, org.id, 2)),
      ...associationOrgs.map((org) => seedPoll(event, org.id, 2)),
    ])

    await refreshMV()

    const result = await getEventInfo(event.id)

    // 15 per type: 15 companies + 15 associations = 30 podium entries
    expect(result.organisations).toHaveLength(30)
    // organisationCount is not capped by the podium limit
    expect(result.organisationCount).toBe(40)
  })

  it('organisationCount is not capped by the podium limit', async () => {
    const event = await createEvent()

    const ORG_COUNT = 20

    const orgs = await Promise.all(
      Array.from({ length: ORG_COUNT }, (_, i) =>
        createOrganisation({ name: `Org ${i}`, slug: `org-${i}` })
      )
    )

    await Promise.all(orgs.map((org) => seedPoll(event, org.id, 2)))
    await refreshMV()

    const result = await getEventInfo(event.id)

    expect(result.organisations).toHaveLength(15)
    expect(result.organisationCount).toBe(ORG_COUNT)
  })
})
