import type { InvalidPayloadError } from '../../../lib/errors.ts'
import { DomainError } from '../../../lib/errors.ts'
import type { Metric } from '../../models/types/rule.ts'
import type { ComputationAlreadyExistsError } from '../../simulation-computation/errors/simulation-computation.error.ts'

export class SimulationNotFoundError extends DomainError<'simulation_not_found'> {
  public readonly simulationId?: string

  constructor(simulationId?: string) {
    super('simulation_not_found', 'Simulation introuvable')
    this.simulationId = simulationId
  }
}

export class SimulationCompletedError extends DomainError<'simulation_completed'> {
  constructor() {
    super('simulation_completed', 'Simulation déjà terminée')
  }
}

export class SimulationIncompleteError extends DomainError<'simulation_incomplete'> {
  constructor() {
    super('simulation_incomplete', 'Simulation non terminée')
  }
}

export class ZeroFootprintError extends DomainError<'zero_footprint'> {
  constructor() {
    super('zero_footprint', 'Bilan carbone nul')
  }
}

export class SimulationInvalidModelStringError extends DomainError<'simulation_invalid_model'> {
  public readonly model: string
  public readonly simulationId?: string
  constructor(model: string, simulationId?: string) {
    super('simulation_invalid_model', 'Modèle de simulation invalide')
    this.model = model
    this.simulationId = simulationId
  }
}

/**
 * A stored rule evaluation breaking its invariant: exactly one value when
 * applicable, none otherwise. Corrupt data is never reinterpreted.
 */
export class CorruptRuleEvaluationError extends DomainError<'corrupt_rule_evaluation'> {
  public readonly simulationId: string
  public readonly name: string
  public readonly metric: Metric

  constructor(params: {
    simulationId: string
    name: string
    metric: Metric
    reason: string
  }) {
    const { simulationId, name, metric, reason } = params
    super(
      'corrupt_rule_evaluation',
      `Rule evaluation of rule ${name} (${metric}) for simulation ${simulationId} ${reason}`
    )
    this.simulationId = simulationId
    this.name = name
    this.metric = metric
  }
}

/**
 * Each failed rule is logged where it failed: this only counts them, one per
 * rule and metric.
 */
export class PublicRulesEvaluationError extends DomainError<'public_rules_evaluation_failed'> {
  public readonly failedCount: number

  constructor(failedCount: number) {
    super(
      'public_rules_evaluation_failed',
      `${failedCount} public rule evaluation(s) failed`
    )
    this.failedCount = failedCount
  }
}

export type UpdateSimulationSituationError =
  | SimulationNotFoundError
  | SimulationCompletedError
  | ZeroFootprintError
  | InvalidPayloadError

export type CompleteSimulationError =
  | SimulationIncompleteError
  | SimulationNotFoundError
  | SimulationCompletedError
  | SimulationInvalidModelStringError
  | ZeroFootprintError
  | ComputationAlreadyExistsError
  | InvalidPayloadError
