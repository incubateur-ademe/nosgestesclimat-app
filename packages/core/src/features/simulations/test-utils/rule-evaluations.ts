import { ruleFactory } from '../../models/factories/rule.factory.ts'
import type { Applicability } from '../../models/types/model-rule-evaluation.ts'
import type { Metric, Rule } from '../../models/types/rule.ts'
import { createRuleEvaluations } from '../repository/rule-evaluations.repository.ts'
import type { NewRuleEvaluation } from '../types/rule-evaluation.ts'
import type { Simulation } from '../types/simulation.ts'
import type { ComputedResults } from '../validators/computed-results.schema.ts'

/** Seeds a rule evaluation of the simulation through the write path. */
export const evaluateRule = async (
  simulation: Simulation,
  rule: Rule,
  applicability: Applicability
): Promise<void> => {
  const evaluation: NewRuleEvaluation = {
    simulationId: simulation.id,
    ruleId: rule.id,
    ...applicability,
    missingVariables: [],
  }
  await createRuleEvaluations([evaluation])
}

export const storeRule = (name: string, metric: Metric): Promise<Rule> =>
  ruleFactory.create({ name, metric })

/** The five zeroed categories of a metric. */
export const zeroedCategories =
  (): ComputedResults['carbone']['categories'] => ({
    alimentation: 0,
    transport: 0,
    logement: 0,
    divers: 0,
    'services sociétaux': 0,
  })
