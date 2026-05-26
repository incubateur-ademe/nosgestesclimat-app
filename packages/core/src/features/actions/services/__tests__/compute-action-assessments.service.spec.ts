import type { NGCRule } from '@incubateur-ademe/nosgestesclimat'
import { afterEach, describe, expect, it } from 'vitest'
import { prisma } from '../../../../prisma/client.ts'
import { createTestEngineWithSituation } from '../../../publicodes-computation/factories/engine.factory.ts'
import { simulationFactory } from '../../../publicodes-computation/factories/simulation.factory.ts'
import { actionFactory } from '../../factories/action.factory.ts'
import { computeActionAssessments } from '../compute-action-assessments.service.ts'

const APPLICABLE_RULE_ID = '00000000-0000-0000-0000-000000000001'
const NOT_APPLICABLE_RULE_ID = '00000000-0000-0000-0000-000000000002'

const testRules = {
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
} as unknown as Record<string, NGCRule>

describe('compute action assessments service', () => {
  afterEach(async () => {
    await prisma.actionAssessment.deleteMany()
    await prisma.action.deleteMany()
    await prisma.simulation.deleteMany()
  })

  it('computes applicable and non-applicable action assessments', async () => {
    const simulation = await simulationFactory.create()
    const [applicableAction, notApplicableAction] = await Promise.all([
      actionFactory.params({ ruleId: APPLICABLE_RULE_ID }).published().create(),
      actionFactory
        .params({ ruleId: NOT_APPLICABLE_RULE_ID })
        .published()
        .create(),
    ])

    const engine = createTestEngineWithSituation(testRules, { dummy: 'oui' })
    await computeActionAssessments(engine, simulation.id)

    // @TODO : use getAction service in this test once it's retrieve the actionAssessment
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
    const simulation = await simulationFactory.create()
    await actionFactory
      .params({ ruleId: '00000000-0000-0000-0000-ffffffffffff' })
      .published()
      .create()

    const engine = createTestEngineWithSituation(testRules, {})
    await computeActionAssessments(engine, simulation.id)

    const assessments = await prisma.actionAssessment.findMany({
      where: { simulationId: simulation.id },
    })

    expect(assessments).toHaveLength(0)
  })
})
