import { faker } from '@faker-js/faker'
import type Engine from 'publicodes'
import type { RawPublicodes } from 'publicodes'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { transaction } from '../../../../lib/transaction.ts'
import { prisma } from '../../../../prisma/client.ts'
import { emptyDatabase } from '../../../../test-utils/empty-database.ts'
import { createTestLogger } from '../../../../test-utils/logger.ts'
import { createTestEngine } from '../../../simulation-computation/factories/engine.factory.ts'
import { simulationFactory } from '../../../simulations/factories/simulation.factory.ts'
import type { Simulation } from '../../../simulations/types/simulation.ts'
import { ActionAssessmentPublicodesError } from '../../errors/action-assessment.error.ts'
import { actionFactory } from '../../factories/action.factory.ts'
import { createAssessActions } from '../assess-actions.service.ts'

const logger = createTestLogger()
const assessActions = createAssessActions({ logger })

const APPLICABLE_RULE_ID = faker.string.uuid()
const NOT_APPLICABLE_RULE_ID = faker.string.uuid()
const BOOLEAN_RULE_ID = faker.string.uuid()

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

describe('assessActions', () => {
  const engine = createTestEngine(testRules)

  let simulation: Simulation

  /**
   * Assesses the actions inside a transaction. PGlite has a single
   * connection, so a write that bypasses the session would hang the test.
   */
  const assess = (withEngine: Engine = engine) =>
    transaction((session) =>
      assessActions(withEngine, simulation.id, { session })
    )

  const findActionAssessments = () =>
    prisma.actionAssessment.findMany({
      where: { simulationId: simulation.id },
    })

  beforeEach(async () => {
    simulation = await simulationFactory.completed().create()
  })

  afterEach(async () => {
    vi.restoreAllMocks()
    await emptyDatabase(prisma)
  })

  it('stores applicable and non-applicable action assessments', async () => {
    const [applicableAction, notApplicableAction] = await Promise.all([
      actionFactory.params({ ruleId: APPLICABLE_RULE_ID }).published().create(),
      actionFactory
        .params({ ruleId: NOT_APPLICABLE_RULE_ID })
        .published()
        .create(),
    ])

    await assess()

    const assessments = await findActionAssessments()
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
      .params({ ruleId: faker.string.uuid() })
      .published()
      .create()

    await assess()

    expect(await findActionAssessments()).toHaveLength(0)
  })

  it('skips actions whose rule evaluation throws', async () => {
    await actionFactory
      .params({ ruleId: APPLICABLE_RULE_ID })
      .published()
      .create()

    vi.spyOn(engine, 'evaluate').mockImplementation(() => {
      throw new Error('Engine evaluation failed')
    })

    await assess()

    expect(await findActionAssessments()).toHaveLength(0)

    // The assessment is dropped, not skipped and forgotten: the failure is
    // reported.
    expect(logger.error).toHaveBeenCalledWith(expect.any(Error), {
      actionId: expect.any(String),
      ruleId: APPLICABLE_RULE_ID,
      dottedName: 'test . applicable',
    })
  })

  it('skips actions whose nodeValue is an unexpected type', async () => {
    await actionFactory.params({ ruleId: BOOLEAN_RULE_ID }).published().create()

    await assess()

    expect(await findActionAssessments()).toHaveLength(0)

    // Detected, not thrown: no `Error` to report, so the line names the shape
    // and the failure stays an anomaly to watch by rate.
    expect(logger.warn).toHaveBeenCalledWith(
      'Unexpected nodeValue: boolean',
      expect.objectContaining({ ruleId: BOOLEAN_RULE_ID })
    )
  })

  describe('throws ActionAssessmentPublicodesError', () => {
    it('when there are no actions in database', async () => {
      await expect(assess()).rejects.toThrow(ActionAssessmentPublicodesError)
    })

    it('when no publicodes rules have meta.id', async () => {
      await actionFactory
        .params({ ruleId: APPLICABLE_RULE_ID })
        .published()
        .create()

      await expect(
        assess(createTestEngine({ 'test . no-meta': { valeur: 42 } }))
      ).rejects.toThrow(ActionAssessmentPublicodesError)
    })
  })
})
