import { afterEach, describe, expect, it } from 'vitest'
import type { NGCRule } from '@incubateur-ademe/nosgestesclimat'
import { prisma } from '../../../prisma/client.ts'
import { actionFactory } from '../../actions/factories/action.factory.ts'
import { createTestEngine } from '../factories/engine.factory.ts'
import { simulationFactory } from '../factories/simulation.factory.ts'
import { processNextPendingComputation } from '../services/coordination.service.ts'
import { getSimulationComputation } from '../services/get-simulation-computation.service.ts'

const APPLICABLE_RULE_ID = '10000000-0000-0000-0000-000000000001'

const testRules = {
  'test . coordination': {
    valeur: 99,
    unité: 'kgCO2e',
    titre: 'Coordination test',
    meta: { id: APPLICABLE_RULE_ID },
  },
} as unknown as Record<string, NGCRule>

describe('coordination service', () => {
  afterEach(async () => {
    await prisma.actionAssessment.deleteMany()
    await prisma.simulationComputation.deleteMany()
    await prisma.action.deleteMany()
    await prisma.simulation.deleteMany()
  })

  it('returns false when no job is pending', async () => {
    const engine = createTestEngine(testRules).shallowCopy()
    const result = await processNextPendingComputation(engine)
    expect(result).toBe(false)
  })

  it('processes a pending job end-to-end', async () => {
    const simulation = await simulationFactory
      .withPendingComputation()
      .create()
    await actionFactory
      .params({ ruleId: APPLICABLE_RULE_ID })
      .published()
      .create()

    const engine = createTestEngine(testRules).shallowCopy()
    const result = await processNextPendingComputation(engine)

    expect(result).toBe(true)

    const computation = await getSimulationComputation(simulation.id)
    expect(computation!.status).toBe('completed')
    expect(computation!.completedAt).not.toBeNull()
  })

  it('reclaims stale processing jobs past the timeout', async () => {
    const simulation = await simulationFactory
      .withStaleProcessingComputation()
      .create()
    await actionFactory
      .params({ ruleId: APPLICABLE_RULE_ID })
      .published()
      .create()

    const engine = createTestEngine(testRules).shallowCopy()
    const result = await processNextPendingComputation(engine)

    expect(result).toBe(true)

    const computation = await getSimulationComputation(simulation.id)
    expect(computation!.status).toBe('completed')
    expect(computation!.completedAt).not.toBeNull()
  })
})
