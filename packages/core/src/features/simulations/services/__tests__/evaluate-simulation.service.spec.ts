import type Engine from 'publicodes'
import type { RawPublicodes } from 'publicodes'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { transaction } from '../../../../lib/transaction.ts'
import { prisma } from '../../../../prisma/client.ts'
import { emptyDatabase } from '../../../../test-utils/empty-database.ts'
import { createTestLogger } from '../../../../test-utils/logger.ts'
import { ActionAssessmentPublicodesError } from '../../../actions/errors/action-assessment.error.ts'
import { actionFactory } from '../../../actions/factories/action.factory.ts'
import { serializeModel } from '../../../models/helpers/model-versions.ts'
import { createTestEngine } from '../../../simulation-computation/factories/engine.factory.ts'
import { simulationFactory } from '../../factories/simulation.factory.ts'
import type { Simulation } from '../../types/simulation.ts'
import { createEvaluateSimulation } from '../evaluate-simulation.service.ts'

const logger = createTestLogger()
const evaluateSimulation = createEvaluateSimulation({ logger })

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

describe('evaluateSimulation', () => {
  const engine = createTestEngine(testRules)

  let simulation: Simulation

  /**
   * Evaluates inside a transaction, like the worker does. PGlite has a single
   * connection, so a write that bypasses the session would hang the test.
   */
  const evaluate = (withEngine: Engine = engine) =>
    transaction((session) =>
      evaluateSimulation(
        withEngine,
        { id: simulation.id, model: serializeModel(simulation.model) },
        { session }
      )
    )

  beforeEach(async () => {
    simulation = await simulationFactory.completed().create()
  })

  afterEach(async () => {
    vi.restoreAllMocks()
    await emptyDatabase(prisma)
  })

  describe('action assessments', () => {
    it('stores applicable and non-applicable action assessments', async () => {
      const [applicableAction, notApplicableAction] = await Promise.all([
        actionFactory
          .params({ ruleId: APPLICABLE_RULE_ID })
          .published()
          .create(),
        actionFactory
          .params({ ruleId: NOT_APPLICABLE_RULE_ID })
          .published()
          .create(),
      ])

      await evaluate()

      const assessments = await prisma.actionAssessment.findMany({
        where: { simulationId: simulation.id },
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

      await evaluate()

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

      await evaluate()

      const assessments = await prisma.actionAssessment.findMany({
        where: { simulationId: simulation.id },
      })
      expect(assessments).toHaveLength(0)

      // The assessment is dropped, not skipped and forgotten: the failure is
      // reported.
      expect(logger.error).toHaveBeenCalledWith(expect.any(Error), {
        actionId: expect.any(String),
        ruleId: APPLICABLE_RULE_ID,
        dottedName: 'test . applicable',
      })
    })

    it('skips actions whose nodeValue is an unexpected type', async () => {
      await actionFactory
        .params({ ruleId: BOOLEAN_RULE_ID })
        .published()
        .create()

      await evaluate()

      const assessments = await prisma.actionAssessment.findMany({
        where: { simulationId: simulation.id },
      })
      expect(assessments).toHaveLength(0)

      // Detected, not thrown: no `Error` to report, so the line names the shape
      // and the failure stays an anomaly to watch by rate.
      expect(logger.warn).toHaveBeenCalledWith(
        expect.stringContaining('Unexpected nodeValue type:'),
        expect.objectContaining({ ruleId: BOOLEAN_RULE_ID })
      )
    })

    describe('throws ActionAssessmentPublicodesError', () => {
      it('when there are no actions in database', async () => {
        await expect(evaluate()).rejects.toThrow(
          ActionAssessmentPublicodesError
        )
      })

      it('when no publicodes rules have meta.id', async () => {
        const engineWithoutMeta = createTestEngine({
          'test . no-meta': { valeur: 42 },
        })

        await actionFactory
          .params({ ruleId: APPLICABLE_RULE_ID })
          .published()
          .create()

        await expect(evaluate(engineWithoutMeta)).rejects.toThrow(
          ActionAssessmentPublicodesError
        )
      })
    })
  })
})
