import { ruleFactory } from '../../models/factories/rule.factory.ts'
import type {
  NewRuleEvaluation,
  RuleEvaluationOutput,
} from '../../models/types/rule-evaluation.ts'
import type { Metric, Rule } from '../../models/types/rule.ts'
import { createRuleEvaluations } from '../repository/rule-evaluations.repository.ts'
import type { Simulation } from '../types/simulation.ts'
import type { ComputedResults } from '../validators/computed-results.schema.ts'

/** Seeds a rule evaluation of the simulation through the write path. */
export const evaluateRule = async (
  simulation: Simulation,
  rule: Rule,
  output: RuleEvaluationOutput
): Promise<void> => {
  const evaluation: NewRuleEvaluation = {
    name: rule.name,
    metric: rule.appliesToWaterMetric ? 'water' : null,
    simulationId: simulation.id,
    createdAt: new Date(),
    ...output,
    missingVariables: [],
  }
  await createRuleEvaluations([evaluation], [rule])
}

/**
 * Stores the rule row of a metric: the water-marked one for 'water', the
 * default one otherwise ('carbon' and null are the same default metric).
 */
export const storeRule = (
  name: string,
  metric: Metric | 'carbon' | null
): Promise<Rule> =>
  ruleFactory.create({ name, appliesToWaterMetric: metric === 'water' })

/** The five zeroed categories of a metric. */
export const zeroedCategories =
  (): ComputedResults['carbone']['categories'] => ({
    alimentation: 0,
    transport: 0,
    logement: 0,
    divers: 0,
    'services sociétaux': 0,
  })
