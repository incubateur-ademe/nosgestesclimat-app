'use client'

import { useQuestionBounds } from '@/form-controller/behaviors/useQuestionBounds'
import { useFormController } from '@/form-controller/core/useFormController'
import {
  mosaicDraft,
  type MosaicComposite,
  type MosaicValue,
} from '@/form-controller/drafts/mosaic'
import { assistanceDraft, scalarDraft } from '@/form-controller/drafts/scalar'
import { useDrafts } from '@/form-controller/drafts/useDrafts'
import { useFormWriteService } from '@/form-controller/write-service/useFormWriteService'
import { useEngine, useRule } from '@/publicodes-state'
import {
  EMPTY_SITUATION,
  useOptionalSimulation,
} from '@/publicodes-state/hooks/useCurrentSimulation/useCurrentSimulation'
import type { DottedName, NodeValue } from '@incubateur-ademe/nosgestesclimat'

interface Base {
  question: DottedName
  label: string | undefined
  description: string | undefined
  suggestions: ReturnType<typeof useRule>['suggestions']
  activeNotifications: DottedName[]
  isMissing: boolean
  /** The value the model gives when the question is unanswered (placeholder). */
  defaultValue: NodeValue
  overLimitQuestions: DottedName[]
}

interface AssistanceProjection {
  value: number | undefined
  situationValue: number | undefined
  unit: string | undefined
  setValue: (value: number | undefined) => void
}

/**
 * A question, ready to render: its read projection plus its draft and the
 * actions to edit it. Discriminated by `type` because the shapes genuinely
 * differ — a scalar is one value, a mosaic is a composite of children.
 * Assistance is a variant of `number`, not a separate type. Inputs are dumb:
 * they receive value/setValue and hold no state of their own.
 */
export type FormQuestion = Base &
  (
    | {
        type: 'boolean'
        value: boolean | undefined
        setValue: (value: boolean | undefined) => void
        commitNow: CommitAnswer
      }
    | {
        type: 'choices'
        value: string | undefined
        setValue: (value: string | undefined) => void
        commitNow: CommitAnswer
        choices: ReturnType<typeof useRule>['choices']
      }
    | {
        type: 'number'
        value: number | undefined
        setValue: (value: number | undefined) => void
        commitNow: CommitAnswer
        unit: string | undefined
        assistance?: AssistanceProjection
      }
    | {
        type: 'numberMosaic' | 'selectMosaic'
        values: MosaicComposite
        setChildValue: (child: DottedName, value: MosaicValue) => void
        commitNow: CommitAnswer
        aucun: boolean
        setAucun: (selected: boolean) => void
        aucunOption: ReturnType<typeof useRule>['aucunOption']
        children: DottedName[]
      }
  )

/** Commit an answer immediately, whatever its shape (suggestions, custom questions). */
type CommitAnswer = (value: NodeValue | Record<string, NodeValue>) => void

/**
 * A question, ready to render: the current one, or any nested question a custom
 * question renders (its precise wardrobe, say).
 */
export function useFormQuestion(question: DottedName): FormQuestion {
  const { currentQuestion } = useFormController()

  const rule = useRule(question)
  const assistanceRule = useRule(rule.assistance ?? question)
  const store = useDrafts()
  const { engine } = useEngine()
  const { setValue } = useFormWriteService()
  const situation = useOptionalSimulation()?.situation ?? EMPTY_SITUATION

  const children = rule.questionsOfMosaicFromParent

  // A custom question renders its own nested questions: every edit belongs to
  // the step the user is on, so flushing that step commits them all.
  const step = currentQuestion ?? question

  // Bounds are read from the draft store, so a nested mosaic warns while typing.
  const { overLimitQuestions } = useQuestionBounds(question, store, step)

  // A suggestion is an answer, not an edit: drop what is staged and write now,
  // so a timer cannot overwrite the suggestion a moment later.
  const commitNow: CommitAnswer = (value) => {
    store.discard(step)
    setValue(question, value, { questionDottedName: question })
  }

  const base: Base = {
    question,
    label: rule.label,
    description: rule.description,
    suggestions: rule.suggestions,
    activeNotifications: rule.activeNotifications,
    isMissing: rule.isMissing,
    defaultValue: rule.value,
    overLimitQuestions,
  }

  if (rule.type === 'numberMosaic' || rule.type === 'selectMosaic') {
    const mosaic = mosaicDraft(store, { step, children, situation })
    return {
      ...base,
      type: rule.type,
      values: mosaic.values,
      setChildValue: mosaic.setChildValue,
      commitNow,
      aucun: mosaic.aucun,
      setAucun: mosaic.setAucun,
      aucunOption: rule.aucunOption,
      children,
    }
  }

  const scalar = scalarDraft(store, {
    step,
    question,
    type: rule.type,
    value: rule.situationValue,
  })

  if (rule.type === 'choices') {
    return {
      ...base,
      type: 'choices',
      value: scalar.value as string | undefined,
      setValue: scalar.setValue,
      commitNow,
      choices: rule.choices,
    }
  }

  if (rule.type === 'number') {
    const assistance = assistanceDraft(store, {
      step,
      question,
      assistance: rule.assistance,
      value: assistanceRule.situationValue as number | undefined,
      engine,
    })

    return {
      ...base,
      type: 'number',
      value: scalar.value as number | undefined,
      setValue: scalar.setValue,
      commitNow,
      unit: rule.unit,
      assistance: assistance
        ? {
            value: assistance.value,
            situationValue: assistanceRule.situationValue as number | undefined,
            unit: assistanceRule.unit,
            setValue: assistance.setValue,
          }
        : undefined,
    }
  }

  // boolean (and any other scalar) fall back to the boolean shape.
  return {
    ...base,
    type: 'boolean',
    value: scalar.value as boolean | undefined,
    setValue: scalar.setValue,
    commitNow,
  }
}
