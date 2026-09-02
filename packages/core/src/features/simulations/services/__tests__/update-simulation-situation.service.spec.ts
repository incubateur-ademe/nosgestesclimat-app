import type { DottedName } from '@incubateur-ademe/nosgestesclimat'
import { afterEach, describe, expect, it } from 'vitest'
import { prisma } from '../../../../prisma/client.ts'
import { userFactory } from '../../../users/factories/user.factory.ts'
import { simulationFactory } from '../../factories/simulation.factory.ts'
import { parseModelString } from '../../repository/model.mapper.ts'
import { findSimulationById } from '../../repository/simulation.repository.ts'
import type { ComputedResults } from '../../validators/computed-results.schema.ts'
import { updateSimulationSituation } from '../update-simulation-situation.service.ts'

describe('updateSimulationSituation', () => {
  afterEach(async () => {
    await prisma.simulationPoll.deleteMany()
    await prisma.groupParticipant.deleteMany()
    await prisma.group.deleteMany()
    await prisma.poll.deleteMany()
    await prisma.organisation.deleteMany()
    await prisma.simulation.deleteMany()
    await prisma.user.deleteMany()
  })

  it('persists the answered fields and leaves unrelated fields untouched', async () => {
    const user = await userFactory.create()
    const simulation = await simulationFactory
      .withModelRegion('FR')
      .withProgression(0.2)
      .params({
        userId: user.id,
        date: new Date('2024-01-01'),
      })
      .create()

    const organisation = await prisma.organisation.create({
      data: { name: 'Test Org', slug: 'test-org' },
    })
    const poll = await prisma.poll.create({
      data: {
        name: 'Test Poll',
        slug: 'test-poll',
        organisationId: organisation.id,
        customAdditionalQuestions: [],
      },
    })
    await prisma.simulationPoll.create({
      data: { pollId: poll.id, simulationId: simulation.id },
    })

    const group = await prisma.group.create({
      data: { name: 'Test Group', emoji: '🌍' },
    })
    await prisma.groupParticipant.create({
      data: { userId: user.id, simulationId: simulation.id, groupId: group.id },
    })

    const result = await updateSimulationSituation({
      userId: user.id,
      simulationId: simulation.id,
      ...payload,
    })

    expect(result).toEqual({ success: true })

    const updated = await findSimulationById({
      id: simulation.id,
      userId: user.id,
    })

    expect(updated).toEqual(
      expect.objectContaining({
        situation,
        foldedSteps,
        progression: 0.5,
        computedResults,
        date: new Date('2024-01-01'),
        groups: [{ id: group.id }],
        polls: [{ id: poll.id, slug: 'test-poll', name: 'Test Poll' }],
      })
    )
  })

  it('leaves the model unchanged when none is supplied', async () => {
    const user = await userFactory.create()
    const simulation = await simulationFactory
      .withModelRegion('FR')
      .withProgression(0.2)
      .params({ userId: user.id })
      .create()

    await updateSimulationSituation({
      userId: user.id,
      simulationId: simulation.id,
      ...payload,
    })

    const updated = await findSimulationById({
      id: simulation.id,
      userId: user.id,
    })

    expect(updated).toEqual(
      expect.objectContaining({ model: simulation.model })
    )
  })

  it('repairs the model when one is supplied', async () => {
    const user = await userFactory.create()
    const simulation = await simulationFactory
      .withModelRegion('FR')
      .withProgression(0.2)
      .params({ userId: user.id })
      .create()

    await prisma.simulation.update({
      where: { id: simulation.id },
      data: { model: 'FR-fr-0.0.0' },
      select: { id: true },
    })

    await updateSimulationSituation({
      userId: user.id,
      simulationId: simulation.id,
      ...payload,
      model: 'FR-fr-4.15.0',
    })

    const updated = await findSimulationById({
      id: simulation.id,
      userId: user.id,
    })

    expect(updated).toEqual(
      expect.objectContaining({ model: parseModelString('FR-fr-4.15.0') })
    )
  })

  it('fails with simulation_not_found for an unknown simulation', async () => {
    const user = await userFactory.create()

    const result = await updateSimulationSituation({
      userId: user.id,
      simulationId: '00000000-0000-0000-0000-000000000000',
      ...payload,
    })

    expect(result).toEqual({
      success: false,
      error: expect.objectContaining({ code: 'simulation_not_found' }),
    })
  })

  it('fails with simulation_not_found for a simulation owned by another user', async () => {
    const [user, other] = await Promise.all([
      userFactory.create(),
      userFactory.create(),
    ])
    const simulation = await simulationFactory
      .withModelRegion('FR')
      .withProgression(0.2)
      .params({ userId: other.id })
      .create()

    const result = await updateSimulationSituation({
      userId: user.id,
      simulationId: simulation.id,
      ...payload,
    })

    expect(result).toEqual({
      success: false,
      error: expect.objectContaining({ code: 'simulation_not_found' }),
    })

    const updated = await findSimulationById({
      id: simulation.id,
      userId: other.id,
    })
    expect(updated).toEqual(
      expect.objectContaining({ progression: 0.2, situation: {} })
    )
  })

  it('refuses to bring a completed simulation back in progress', async () => {
    const user = await userFactory.create()
    const simulation = await simulationFactory
      .withModelRegion('FR')
      .completed()
      .params({ userId: user.id })
      .create()

    const result = await updateSimulationSituation({
      userId: user.id,
      simulationId: simulation.id,
      ...payload,
    })

    expect(result).toEqual({
      success: false,
      error: expect.objectContaining({ code: 'simulation_completed' }),
    })

    const updated = await findSimulationById({
      id: simulation.id,
      userId: user.id,
    })
    expect(updated).toEqual(
      expect.objectContaining({ progression: 1, situation: {} })
    )
  })

  it('refuses to update a completed simulation even when the payload stays completed', async () => {
    const user = await userFactory.create()
    const simulation = await simulationFactory
      .withModelRegion('FR')
      .completed()
      .params({ userId: user.id })
      .create()

    const result = await updateSimulationSituation({
      userId: user.id,
      simulationId: simulation.id,
      ...payload,
      progression: 1,
    })

    expect(result).toEqual({
      success: false,
      error: expect.objectContaining({ code: 'simulation_completed' }),
    })

    const updated = await findSimulationById({
      id: simulation.id,
      userId: user.id,
    })
    expect(updated).toEqual(expect.objectContaining({ situation: {} }))
  })

  it('fails with zero_footprint when the carbon footprint is zero', async () => {
    const user = await userFactory.create()
    const simulation = await simulationFactory
      .withModelRegion('FR')
      .withProgression(0.2)
      .params({ userId: user.id })
      .create()

    const result = await updateSimulationSituation({
      userId: user.id,
      simulationId: simulation.id,
      ...payload,
      computedResults: zeroedComputedResults,
    })

    expect(result).toEqual({
      success: false,
      error: expect.objectContaining({ code: 'zero_footprint' }),
    })

    const updated = await findSimulationById({
      id: simulation.id,
      userId: user.id,
    })
    expect(updated).toEqual(expect.objectContaining({ situation: {} }))
  })
})

const computedResults: ComputedResults = {
  carbone: {
    bilan: 1000,
    categories: {
      alimentation: 300,
      transport: 400,
      logement: 200,
      divers: 50,
      'services sociétaux': 50,
    },
    subcategories: {},
  },
  eau: {
    bilan: 500,
    categories: {
      alimentation: 150,
      transport: 200,
      logement: 100,
      divers: 25,
      'services sociétaux': 25,
    },
    subcategories: {},
  },
}

const zeroedComputedResults: ComputedResults = {
  ...computedResults,
  carbone: { ...computedResults.carbone, bilan: 0 },
}

const situation = {
  'transport . voiture . km': 12000,
} as unknown as Record<DottedName, number>
const foldedSteps = ['transport . voiture . km'] as DottedName[]

const payload = {
  situation,
  foldedSteps,
  progression: 0.5,
  computedResults,
} satisfies Omit<
  Parameters<typeof updateSimulationSituation>[0],
  'simulationId' | 'userId'
>
