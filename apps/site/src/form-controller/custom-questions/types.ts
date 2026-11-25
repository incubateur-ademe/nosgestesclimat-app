import type { SafeEvaluate, Situation } from '@/publicodes-state/types'
import type { DottedName, NodeValue } from '@incubateur-ademe/nosgestesclimat'
import type { ComponentType } from 'react'

/** A set of rule writes produced by a custom question. */
export type SituationPatch = Partial<Record<DottedName, NodeValue>>

export interface CustomQuestionRendererProps<Draft = unknown> {
  question: DottedName
  draft?: Draft
  onChange?: (draft: Draft) => void
}

interface DeriveContext {
  situation: Situation
  evaluate: SafeEvaluate
  /** The mosaic children of a rule; empty for a scalar. */
  childrenOf: (dottedName: DottedName) => DottedName[]
}

/** Declare a custom question with its own draft type; the registry erases it. */
export function defineCustomQuestion<Draft>(
  custom: CustomQuestion<Draft>
): CustomQuestion<unknown> {
  return custom as CustomQuestion<unknown>
}

/**
 * A custom question: its own renderer, plus the state it needs. `draft` and
 * `onCommit` let the renderer edit a value the controller owns; `derive` writes
 * what the answers imply. A patch that writes the question folds it.
 */
export interface CustomQuestion<Draft = unknown> {
  match: (question: DottedName) => boolean
  Renderer: ComponentType<CustomQuestionRendererProps<Draft>>
  draft?: {
    load: (ctx: { question: DottedName; situation: Situation }) => Draft
    persist?: (question: DottedName, draft: Draft) => void
  }
  onCommit?: (ctx: { draft: Draft; question: DottedName }) => SituationPatch
  derive?: (ctx: DeriveContext) => SituationPatch | undefined
}
