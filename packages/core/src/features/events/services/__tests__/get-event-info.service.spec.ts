import { afterEach, describe, expect, it } from 'vitest'
import { prisma } from '../../../../prisma/client.ts'
import { organisationFactory } from '../../../organisations/factories/organisation.factory.ts'
import { pollFactory } from '../../../polls/factories/poll.factory.ts'
import { simulationFactory } from '../../../simulations/factories/simulation.factory.ts'
import { eventFactory } from '../../factories/event.factory.ts'
import { refreshEventComputation } from '../../repositories/event.repository.ts'
import type { EventInfo } from '../../types/event-info.ts'
import { getEventInfo } from '../get-event-info.service.ts'

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
  const poll = await pollFactory.create({
    name: `Poll ${organisationId}`,
    slug: `poll-${organisationId}-${Math.random().toString(36).slice(2, 8)}`,
    organisationId,
    createdAt:
      options.pollCreatedAt ??
      new Date(
        event.startDate.getTime() +
          (event.endDate.getTime() - event.startDate.getTime()) / 2
      ),
  })

  const simulationCreatedAt = (i: number) =>
    options.simulationDates?.[i] ??
    new Date(poll.createdAt.getTime() + i * 1_000) // 1s apart to avoid duplicates

  for (let i = 0; i < simulationCount; i++) {
    const sim = await simulationFactory.create({
      createdAt: simulationCreatedAt(i),
      // The shared factory randomizes progression by default: make it explicit
      // so only the requested value ends up in the event window.
      progression: options.simulationProgression ?? 1,
    })
    await prisma.simulationPoll.create({
      data: { pollId: poll.id, simulationId: sim.id },
    })
  }
}

/** Assert the result is not null and narrow its type for the compiler. */
const expectEventInfo = (result: EventInfo | null): EventInfo => {
  expect(result).not.toBeNull()
  if (!result) throw new Error('getEventInfo should return event info')
  return result
}

describe('getEventInfo', () => {
  afterEach(async () => {
    await prisma.simulationPoll.deleteMany()
    await prisma.simulation.deleteMany()
    await prisma.poll.deleteMany()
    await prisma.organisation.deleteMany()
    await prisma.event.deleteMany()
    await refreshEventComputation()
  })

  it('returns null when event does not exist', async () => {
    const result = await getEventInfo('non-existent-id')

    expect(result).toBeNull()
  })

  it('resolves the event by slug', async () => {
    const event = await eventFactory.create({ slug: 'sedd' })

    const result = expectEventInfo(await getEventInfo('sedd'))

    expect(result.startDate.toISOString()).toBe(event.startDate.toISOString())
    expect(result.endDate.toISOString()).toBe(event.endDate.toISOString())
    expect(event.id).toBeTruthy()
  })

  it('returns zeroes when event has no polls and no simulations', async () => {
    const event = await eventFactory.create()

    const result = expectEventInfo(await getEventInfo(event.id))

    expect(result).toEqual({
      organisations: [],
      totalSimulations: 0,
      organisationCount: 0,
      startDate: event.startDate,
      endDate: event.endDate,
    })
  })

  it('returns totalSimulations even when event has no polls', async () => {
    const event = await eventFactory.create()

    // Simulation in the date range, but no poll — should still be counted
    await simulationFactory.create({
      createdAt: new Date(event.startDate.getTime() + 60 * 60 * 1000),
      progression: 1,
    })
    await refreshEventComputation()

    const result = expectEventInfo(await getEventInfo(event.id))

    expect(result.organisations).toEqual([])
    expect(result.totalSimulations).toBe(1)
    expect(result.organisationCount).toBe(0)
  })

  it('returns organisation with correct fields and simulationsCount', async () => {
    const event = await eventFactory.create()

    const org = await organisationFactory.create({
      name: 'Org Alpha',
      slug: 'org-alpha',
      type: 'company',
    })

    await seedPoll(event, org.id, 3)
    await refreshEventComputation()

    const result = expectEventInfo(await getEventInfo(event.id))

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

  it('returns only mobilised organisations ordered by simulationsCount DESC', async () => {
    const event = await eventFactory.create()

    const [orgA, orgB, orgC] = await Promise.all([
      organisationFactory.create({ name: 'A', slug: 'a' }),
      organisationFactory.create({ name: 'B', slug: 'b' }),
      organisationFactory.create({ name: 'C', slug: 'c' }),
    ])

    await Promise.all([
      seedPoll(event, orgA.id, 1), // 1 simulation: not mobilised, off the podium
      seedPoll(event, orgB.id, 5),
      seedPoll(event, orgC.id, 3),
    ])

    await refreshEventComputation()

    const result = expectEventInfo(await getEventInfo(event.id))

    expect(result.organisations.map((o) => o.slug)).toEqual(['b', 'c'])
    expect(result.organisationCount).toBe(2)
  })

  it('counts only organisations with at least 3 simulations as mobilised', async () => {
    const event = await eventFactory.create()

    const orgWithOneSim = await organisationFactory.create({
      name: 'One Sim',
      slug: 'one-sim',
    })
    const orgWithThreeSims = await organisationFactory.create({
      name: 'Three Sims',
      slug: 'three-sims',
    })

    await seedPoll(event, orgWithOneSim.id, 1)
    await seedPoll(event, orgWithThreeSims.id, 3)

    await refreshEventComputation()

    const result = expectEventInfo(await getEventInfo(event.id))

    // 1 simulation is not enough to be counted as "mobilised"
    // (>= MOBILISED_ORGANISATION_MIN_SIMULATIONS required)
    expect(result.organisationCount).toBe(1)

    // ... and such an organisation does not make the podium either, so the
    // podium always matches the mobilised counter.
    expect(result.organisations.map((o) => o.slug)).toEqual(['three-sims'])
  })

  it('counts simulations from old polls created before the event window (Exemple 1)', async () => {
    const event = await eventFactory.create()

    const oldOrg = await organisationFactory.create({
      name: 'Old Org',
      slug: 'old-org',
    })

    // The poll was created before the event window, but the simulations are
    // done during the event window.
    await seedPoll(event, oldOrg.id, 3, {
      pollCreatedAt: new Date(
        event.startDate.getTime() - 2 * 24 * 60 * 60 * 1000
      ),
      simulationDates: [
        new Date(event.startDate.getTime() + 60 * 60 * 1000),
        new Date(event.startDate.getTime() + 2 * 60 * 60 * 1000),
        new Date(event.startDate.getTime() + 3 * 60 * 60 * 1000),
      ],
    })

    await refreshEventComputation()

    const result = expectEventInfo(await getEventInfo(event.id))

    expect(result.organisations).toHaveLength(1)
    expect(result.organisations[0].slug).toBe('old-org')
    expect(result.organisations[0].simulationsCount).toBe(3)
    expect(result.totalSimulations).toBe(3)
    expect(result.organisationCount).toBe(1)
  })

  it('counts only simulations created during the event window for an organisation created before the event', async () => {
    const event = await eventFactory.create()

    const oldOrg = await organisationFactory.create({
      name: 'Old Org',
      slug: 'old-org',
      createdAt: new Date(event.startDate.getTime() - 30 * 24 * 60 * 60 * 1000),
    })

    // Simulations run before the event window: must not be counted.
    await seedPoll(event, oldOrg.id, 2, {
      pollCreatedAt: new Date(
        event.startDate.getTime() - 2 * 24 * 60 * 60 * 1000
      ),
      simulationDates: [
        new Date(event.startDate.getTime() - 2 * 24 * 60 * 60 * 1000),
        new Date(event.startDate.getTime() - 24 * 60 * 60 * 1000),
      ],
    })

    // Simulations run during the event window: these are the only ones counted.
    await seedPoll(event, oldOrg.id, 3, {
      simulationDates: [
        new Date(event.startDate.getTime() + 60 * 60 * 1000),
        new Date(event.startDate.getTime() + 2 * 60 * 60 * 1000),
        new Date(event.startDate.getTime() + 3 * 60 * 60 * 1000),
      ],
    })

    await refreshEventComputation()

    const result = expectEventInfo(await getEventInfo(event.id))

    expect(result.organisations).toHaveLength(1)
    expect(result.organisations[0].slug).toBe('old-org')
    expect(result.organisations[0].simulationsCount).toBe(3)
    expect(result.totalSimulations).toBe(3)
    expect(result.organisationCount).toBe(1)
  })

  it('does not count incomplete simulations (progression < 1)', async () => {
    const event = await eventFactory.create()

    const org = await organisationFactory.create({
      name: 'Org',
      slug: 'org',
    })

    // 3 completed + 1 in progress (progression = 0.5)
    await seedPoll(event, org.id, 3)
    await seedPoll(event, org.id, 1, { simulationProgression: 0.5 })

    await refreshEventComputation()

    const result = expectEventInfo(await getEventInfo(event.id))

    expect(result.organisations[0].simulationsCount).toBe(3)
    expect(result.totalSimulations).toBe(3)
  })

  it('excludes ademe-sedd from the podium but counts it as mobilised', async () => {
    const event = await eventFactory.create()

    const seddOrg = await organisationFactory.create({
      name: 'ADEME SEDD',
      slug: 'ademe-sedd',
    })
    const otherOrg = await organisationFactory.create({
      name: 'Other',
      slug: 'other',
    })

    await Promise.all([
      seedPoll(event, seddOrg.id, 5),
      seedPoll(event, otherOrg.id, 3),
    ])

    await refreshEventComputation()

    const result = expectEventInfo(await getEventInfo(event.id))

    // The ademe-sedd org has 5 simulations but must not appear in the list
    expect(result.organisations.map((o) => o.slug)).toEqual(['other'])
    // ADEME still counts as a mobilised organisation
    // (rule 3: >= MOBILISED_ORGANISATION_MIN_SIMULATIONS simulations)
    expect(result.organisationCount).toBe(2)
  })

  it('still counts ademe-sedd simulations in totalSimulations', async () => {
    const event = await eventFactory.create()

    const seddOrg = await organisationFactory.create({
      name: 'ADEME SEDD',
      slug: 'ademe-sedd',
    })
    const otherOrg = await organisationFactory.create({
      name: 'Other',
      slug: 'other',
    })

    await Promise.all([
      seedPoll(event, seddOrg.id, 5),
      seedPoll(event, otherOrg.id, 2),
    ])

    await refreshEventComputation()

    const result = expectEventInfo(await getEventInfo(event.id))

    // totalSimulations counts every completed simulation in the window, ADEME included
    expect(result.totalSimulations).toBe(7)
  })

  it('includes simulation exactly at startDate in totalSimulations', async () => {
    const event = await eventFactory.create()

    await simulationFactory.create({
      createdAt: event.startDate,
      progression: 1,
    })
    await refreshEventComputation()

    const result = expectEventInfo(await getEventInfo(event.id))

    expect(result.totalSimulations).toBe(1)
  })

  it('includes simulation exactly at endDate in totalSimulations', async () => {
    const event = await eventFactory.create()

    await simulationFactory.create({
      createdAt: event.endDate,
      progression: 1,
    })
    await refreshEventComputation()

    const result = expectEventInfo(await getEventInfo(event.id))

    expect(result.totalSimulations).toBe(1)
  })

  it('excludes simulation outside date range from totalSimulations', async () => {
    const event = await eventFactory.create()

    await simulationFactory.create({
      createdAt: new Date(event.startDate.getTime() - 1000),
      progression: 1,
    }) // 1s before
    await simulationFactory.create({
      createdAt: new Date(event.endDate.getTime() + 1000),
      progression: 1,
    }) // 1s after
    await refreshEventComputation()

    const result = expectEventInfo(await getEventInfo(event.id))

    expect(result.totalSimulations).toBe(0)
  })

  it('returns the top 15 organisations per type', async () => {
    const event = await eventFactory.create()

    // 20 companies (4 simulations each) + 20 associations (3 simulations each).
    // The podium must return the 15 best of each type, not a global top 15.
    const companyOrgs = await Promise.all(
      Array.from({ length: 20 }, (_, i) =>
        organisationFactory.create({
          name: `Company ${i}`,
          slug: `company-${i}`,
          type: 'company',
        })
      )
    )
    const associationOrgs = await Promise.all(
      Array.from({ length: 20 }, (_, i) =>
        organisationFactory.create({
          name: `Association ${i}`,
          slug: `association-${i}`,
          type: 'association',
        })
      )
    )

    await Promise.all([
      ...companyOrgs.map((org) => seedPoll(event, org.id, 4)),
      ...associationOrgs.map((org) => seedPoll(event, org.id, 3)),
    ])

    await refreshEventComputation()

    const result = expectEventInfo(await getEventInfo(event.id))

    expect(result.organisations).toHaveLength(30)
    expect(
      result.organisations.filter((o) => o.type === 'company')
    ).toHaveLength(15)
    expect(
      result.organisations.filter((o) => o.type === 'association')
    ).toHaveLength(15)
    // Companies (4 simulations) rank above associations (3 simulations)
    expect(
      result.organisations.slice(0, 15).every((o) => o.type === 'company')
    ).toBe(true)
    // organisationCount counts every mobilised organisation
    // (>= MOBILISED_ORGANISATION_MIN_SIMULATIONS simulations)
    expect(result.organisationCount).toBe(40)
  })

  it('organisationCount is not capped by the podium limit', async () => {
    const event = await eventFactory.create()

    const ORG_COUNT = 20

    const orgs = await Promise.all(
      Array.from({ length: ORG_COUNT }, (_, i) =>
        organisationFactory.create({ name: `Org ${i}`, slug: `org-${i}` })
      )
    )

    await Promise.all(orgs.map((org) => seedPoll(event, org.id, 3)))
    await refreshEventComputation()

    const result = expectEventInfo(await getEventInfo(event.id))

    expect(result.organisations).toHaveLength(15)
    expect(result.organisationCount).toBe(ORG_COUNT)
  })

  it('orders equal scores deterministically by organisation id', async () => {
    const event = await eventFactory.create()

    const orgB = await organisationFactory.create({ name: 'B', slug: 'b' })
    const orgA = await organisationFactory.create({ name: 'A', slug: 'a' })

    await Promise.all([
      seedPoll(event, orgB.id, 3),
      seedPoll(event, orgA.id, 3),
    ])

    await refreshEventComputation()

    const result = expectEventInfo(await getEventInfo(event.id))

    // Same score: sorted by organisationId ASC (deterministic tie-break).
    const ids = result.organisations.map((o) => o.id)
    expect(ids).toEqual([...ids].sort())
  })
})
