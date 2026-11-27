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

/** A nodeValue its reader cannot use: one that cannot be stored, or a non-number action impact. */
export class UnexpectedNodeValueError extends DomainError<'unexpected_node_value'> {
  public readonly ruleName: string
  public readonly metric?: Metric | null
  /** Its type, or the value itself when its type says nothing. */
  public readonly nodeValue: string

  constructor(params: {
    ruleName: string
    nodeValue: string
    metric?: Metric | null
  }) {
    const { ruleName, nodeValue, metric } = params
    super('unexpected_node_value', `Unexpected nodeValue: ${nodeValue}`)
    this.ruleName = ruleName
    if (metric !== undefined) {
      this.metric = metric
    }
    this.nodeValue = nodeValue
  }
}

/** E.g. a rule missing from the model, or a formula the engine cannot evaluate. */
export class RuleEvaluationThrewError extends DomainError<'rule_evaluation_threw'> {
  public readonly ruleName: string
  public readonly metric?: Metric | null

  constructor(params: {
    ruleName: string
    cause: unknown
    metric?: Metric | null
  }) {
    const { ruleName, cause, metric } = params
    super('rule_evaluation_threw', 'Rule evaluation threw')
    this.ruleName = ruleName
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
