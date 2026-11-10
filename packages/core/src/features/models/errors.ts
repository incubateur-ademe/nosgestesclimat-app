import { DomainError } from '../../lib/errors.ts'
import type { Metric } from './types/rule.ts'

export class ModelFileFetchFailedError extends DomainError<'model_file_fetch_failed'> {
  public readonly url: string
  public readonly status?: number

  constructor(params: {
    message: string
    url: string
    status?: number
    cause?: unknown
  }) {
    const { message, url, status, cause } = params
    super('model_file_fetch_failed', message)
    this.url = url
    if (status !== undefined) {
      this.status = status
    }
    if (cause !== undefined) {
      this.cause = cause
    }
  }
}

export class OutdatedModelVersionError extends DomainError<'outdated_model_version'> {
  public readonly publishedTag: string
  public readonly currentModelVersion: string

  constructor(params: {
    message: string
    publishedTag: string
    currentModelVersion: string
  }) {
    const { message, publishedTag, currentModelVersion } = params
    super('outdated_model_version', message)
    this.publishedTag = publishedTag
    this.currentModelVersion = currentModelVersion
  }
}

/**
 * The engine evaluated a rule to a value that cannot be stored: `true`, a
 * string, NaN or ±Infinity. `nodeValue` names it: its type, or its value for
 * NaN and ±Infinity.
 */
export class UnexpectedNodeValueError extends DomainError<'unexpected_node_value'> {
  public readonly dottedName: string
  public readonly metric?: Metric
  public readonly nodeValue: string

  constructor(params: {
    dottedName: string
    metric?: Metric
    nodeValue: string
  }) {
    const { dottedName, metric, nodeValue } = params
    super('unexpected_node_value', `Unexpected nodeValue: ${nodeValue}`)
    this.dottedName = dottedName
    if (metric !== undefined) {
      this.metric = metric
    }
    this.nodeValue = nodeValue
  }
}

/**
 * The engine threw while evaluating a rule: a rule missing from the model, or
 * a formula it cannot evaluate. The thrown value is the `cause`.
 */
export class RuleEvaluationThrewError extends DomainError<'rule_evaluation_threw'> {
  public readonly dottedName: string
  public readonly metric?: Metric

  constructor(params: { dottedName: string; metric?: Metric; cause: unknown }) {
    const { dottedName, metric, cause } = params
    super('rule_evaluation_threw', 'Rule evaluation threw')
    this.dottedName = dottedName
    if (metric !== undefined) {
      this.metric = metric
    }
    this.cause = cause
  }
}

/** Why the engine gave a rule no applicability that can be stored. */
export type RuleEvaluationError =
  | UnexpectedNodeValueError
  | RuleEvaluationThrewError
