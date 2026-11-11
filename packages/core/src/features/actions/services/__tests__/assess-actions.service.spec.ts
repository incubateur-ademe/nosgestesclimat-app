import { faker } from '@faker-js/faker'
import type Engine from 'publicodes'
import type { RawPublicodes } from 'publicodes'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { failure, success } from '../../../../lib/result.ts'
import { transaction } from '../../../../lib/transaction.ts'
import { prisma } from '../../../../prisma/client.ts'
import { emptyDatabase } from '../../../../test-utils/empty-database.ts'
import { createTestLogger } from '../../../../test-utils/logger.ts'
import { createTestEngine } from '../../../simulation-computation/factories/engine.factory.ts'
import { simulationFactory } from '../../../simulations/factories/simulation.factory.ts'
import type { Simulation } from '../../../simulations/types/simulation.ts'
import { ActionAssessmentPublicodesError } from '../../errors/action-assessment.error.ts'
import { actionFactory } from '../../factories/action.factory.ts'
import { findActionAssessmentsBySimulation } from '../../repositories/action-assessments.repository.ts'
import { createAssessActions } from '../assess-actions.service.ts'

const logger = createTestLogger()
const assessActions = createAssessActions({ logger })

const APPLICABLE_RULE_ID = faker.string.uuid()
const NOT_APPLICABLE_RULE_ID = faker.string.uuid()
const BOOLEAN_RULE_ID = faker.string.uuid()
const STRING_RULE_ID = faker.string.uuid()

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
  'test . string': {
    valeur: "'texte'",
    titre: 'Test string',
    meta: { id: STRING_RULE_ID },
  },
}

describe('assessActions', () => {
  const engine = createTestEngine(testRules)

  let simulation: Simulation

  /**
   * PGlite has a single connection, so a write that bypasses the session
   * would hang the test.
   */
  const assess = (withEngine: Engine = engine) =>
    transaction((session) =>
      assessActions(withEngine, simulation.id, { session })
    )

  const findActionAssessments = () =>
    findActionAssessmentsBySimulation(simulation.id)

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

    expect(await assess()).toEqual(success())

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
    expect(notApplicableAssessment.impact).toBeUndefined()
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

    const thrown = new Error('Engine evaluation failed')
    vi.spyOn(engine, 'evaluate').mockImplementation(() => {
      throw thrown
    })

    await assess()

    expect(await findActionAssessments()).toHaveLength(0)

    // The assessment is dropped, not skipped and forgotten: the failure is
    // reported.
    expect(logger.error).toHaveBeenCalledWith(thrown, {
      actionId: expect.any(String),
      ruleId: APPLICABLE_RULE_ID,
      dottedName: 'test . applicable',
    })
  })

  it.each([
    { type: 'boolean', ruleId: BOOLEAN_RULE_ID },
    { type: 'string', ruleId: STRING_RULE_ID },
  ])('skips actions whose nodeValue is a $type', async ({ type, ruleId }) => {
    await actionFactory.params({ ruleId }).published().create()

    await assess()

    expect(await findActionAssessments()).toHaveLength(0)

    expect(logger.warn).toHaveBeenCalledWith(
      `Unexpected nodeValue type: ${type}`,
      expect.objectContaining({ ruleId })
    )
  })

  it.each([NaN, Infinity, -Infinity])(
    'stores an action whose nodeValue is %s as applicable, without impact',
    async (nodeValue) => {
      const action = await actionFactory
        .params({ ruleId: APPLICABLE_RULE_ID })
        .published()
        .create()
      // No publicodes formula evaluates to a non-finite number.
      const evaluate = engine.evaluate.bind(engine)
      vi.spyOn(engine, 'evaluate').mockImplementation((expression) => ({
        ...evaluate(expression),
        nodeValue,
      }))

      await assess()

      expect(await findActionAssessments()).toEqual([
        expect.objectContaining({
          actionId: action.id,
          applicable: true,
          impact: undefined,
        }),
      ])
      const reported = [
        expect.anything(),
        expect.objectContaining({ actionId: action.id }),
      ]
      expect(logger.warn).not.toHaveBeenCalledWith(...reported)
      expect(logger.error).not.toHaveBeenCalledWith(...reported)
    }
  )

  // A retried computation keeps the assessments of its first attempt.
  describe('of a simulation already assessed', () => {
    it('does not assess the actions again', async () => {
      const action = await actionFactory
        .params({ ruleId: APPLICABLE_RULE_ID })
        .published()
        .create()
      await assess()
      const [assessment] = await findActionAssessments()
      const evaluate = vi.spyOn(engine, 'evaluate')

      await assess()

      expect(evaluate).not.toHaveBeenCalled()
      expect(await findActionAssessments()).toEqual([assessment])
      expect(assessment).toMatchObject({ actionId: action.id, impact: 42 })
    })

    it('does not assess an action published since', async () => {
      await actionFactory
        .params({ ruleId: APPLICABLE_RULE_ID })
        .published()
        .create()
      await assess()
      await actionFactory
        .params({ ruleId: NOT_APPLICABLE_RULE_ID })
        .published()
        .create()

      await assess()

      expect(await findActionAssessments()).toHaveLength(1)
    })
  })

  describe('fails with ActionAssessmentPublicodesError', () => {
    it('when there are no actions in database', async () => {
      expect(await assess()).toEqual(
        failure(expect.any(ActionAssessmentPublicodesError))
      )
    })

    it('when no publicodes rules have meta.id', async () => {
      await actionFactory
        .params({ ruleId: APPLICABLE_RULE_ID })
        .published()
        .create()

      expect(
        await assess(createTestEngine({ 'test . no-meta': { valeur: 42 } }))
      ).toEqual(failure(expect.any(ActionAssessmentPublicodesError)))
      expect(await findActionAssessments()).toHaveLength(0)
    })
  })
})
