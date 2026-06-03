import type { RawPublicodes } from 'publicodes'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { prisma } from '../../../../prisma/client.ts'
import { createTestEngine } from '../../../publicodes-computation/factories/engine.factory.ts'
import { simulationFactory } from '../../../publicodes-computation/factories/simulation.factory.ts'
import { actionFactory } from '../../factories/action.factory.ts'
import { assessActions } from '../assess-actions.service.ts'

const APPLICABLE_RULE_ID = '00000000-0000-0000-0000-000000000001'
const NOT_APPLICABLE_RULE_ID = '00000000-0000-0000-0000-000000000002'
const BOOLEAN_RULE_ID = '00000000-0000-0000-0000-000000000004'

const testRules: RawPublicodes<string> = {
  'test . applicable': {
    valeur: 42,
    unité: 'kgCO2e',
    titre: 'Test applicable',
    meta: { id: APPLICABLE_RULE_ID },
  },
  'test . not-applicable': {
    'est non applicable': 'oui',
    titre: 'Test not applicable',
    meta: { id: NOT_APPLICABLE_RULE_ID },
  },
  'test . boolean': {
    valeur: 'oui',
    titre: 'Test boolean',
    meta: { id: BOOLEAN_RULE_ID },
  },
}

describe('compute action assessments service', () => {
  const engine = createTestEngine(testRules)

  let simulation: Awaited<ReturnType<typeof simulationFactory.create>>

  beforeEach(async () => {
    simulation = await simulationFactory.create()
  })

  afterEach(async () => {
    vi.restoreAllMocks()
    await prisma.actionAssessment.deleteMany()
    await prisma.action.deleteMany()
    await prisma.simulation.deleteMany()
  })

  it('computes applicable and non-applicable action assessments', async () => {
    const [applicableAction, notApplicableAction] = await Promise.all([
      actionFactory.params({ ruleId: APPLICABLE_RULE_ID }).published().create(),
      actionFactory
        .params({ ruleId: NOT_APPLICABLE_RULE_ID })
        .published()
        .create(),
    ])

    await assessActions(engine, simulation.id, null)

    const assessments = await prisma.actionAssessment.findMany({
      where: { simulationId: simulation.id },
      orderBy: { actionId: 'asc' },
    })

    expect(assessments).toHaveLength(2)

    const applicableAssessment = assessments.find(
      (a) => a.actionId === applicableAction.id
    )!
    expect(applicableAssessment.applicable).toBe(true)
    expect(applicableAssessment.impact).toBe(42)

    const notApplicableAssessment = assessments.find(
      (a) => a.actionId === notApplicableAction.id
    )!
    expect(notApplicableAssessment.applicable).toBe(false)
    expect(notApplicableAssessment.impact).toBeNull()
  })

  it('skips actions whose ruleId is not found in the engine', async () => {
    await actionFactory
      .params({ ruleId: '00000000-0000-0000-0000-ffffffffffff' })
      .published()
      .create()

    await assessActions(engine, simulation.id, null)

    const assessments = await prisma.actionAssessment.findMany({
      where: { simulationId: simulation.id },
    })

    expect(assessments).toHaveLength(0)
  })

  it('does not crash when there are no visible actions', async () => {
    await assessActions(engine, simulation.id, null)

    const assessments = await prisma.actionAssessment.findMany({
      where: { simulationId: simulation.id },
    })
    expect(assessments).toHaveLength(0)
  })

  it('skips actions whose rule evaluation throws', async () => {
    await actionFactory
      .params({ ruleId: APPLICABLE_RULE_ID })
      .published()
      .create()

    vi.spyOn(engine, 'evaluate').mockImplementation(() => {
      throw new Error('Engine evaluation failed')
    })

    await assessActions(engine, simulation.id, null)

    const assessments = await prisma.actionAssessment.findMany({
      where: { simulationId: simulation.id },
    })
    expect(assessments).toHaveLength(0)
  })

  it('skips actions whose nodeValue is an unexpected type', async () => {
    await actionFactory.params({ ruleId: BOOLEAN_RULE_ID }).published().create()

    await assessActions(engine, simulation.id, null)

    const assessments = await prisma.actionAssessment.findMany({
      where: { simulationId: simulation.id },
    })
    expect(assessments).toHaveLength(0)
  })
})
