'use client'

import { checkIfDottedNameShouldNotBeIgnored } from '@/publicodes-state/helpers/checkIfDottedNameShouldNotBeIgnored'
import getType from '@/publicodes-state/helpers/getType'
import useEngine from '@/publicodes-state/hooks/useEngine/useEngine'
import useUser from '@/publicodes-state/hooks/useUser/useUser'
import type { Situation } from '@/publicodes-state/types'
import type { DottedName, NodeValue } from '@incubateur-ademe/nosgestesclimat'
import { utils } from 'publicodes'
import { useCallback } from 'react'
import { checkValueValidity } from './checkValueValidity'

interface SetValueOptions {
  /** When set, the question is also marked as folded after the write. */
  questionDottedName?: DottedName
}

interface FoldQuestionOptions {
  dottedName: DottedName
}

export interface WriteService {
  setValue: (
    dottedName: DottedName,
    value: NodeValue | Record<string, NodeValue>,
    options?: SetValueOptions
  ) => void
  applyPatch: (
    patch: Partial<Record<DottedName, NodeValue>>,
    options?: SetValueOptions
  ) => void
  foldQuestion: (options: FoldQuestionOptions) => void
}

/**
 * The single write bridge to Publicodes: every form mutation (value commit,
 * mosaic commit, fold) goes through here so normalization, engine situation and
 * folded steps stay consistent in one place.
 */
export function useFormWriteService(): WriteService {
  const {
    safeGetRule,
    safeEvaluate,
    parsedRules,
    rawMissingVariables,
    addToEngineSituation,
  } = useEngine()
  const { updateCurrentSimulation } = useUser()

  const normalizeValue = useCallback(
    (dottedName: DottedName, value: unknown): NodeValue => {
      const type = getType({
        dottedName,
        rule: safeGetRule(dottedName),
        evaluation: safeEvaluate(dottedName),
      })
      return checkValueValidity({ value, type })
    },
    [safeGetRule, safeEvaluate]
  )

  /** Write a patch, then fold the answered question. The single commit tail. */
  const applyPatch = useCallback(
    (
      patch: Partial<Record<DottedName, NodeValue>>,
      { questionDottedName }: SetValueOptions = {}
    ) => {
      const situationToAdd = Object.fromEntries(
        Object.entries(patch).map(([dottedName, value]) => [
          dottedName,
          normalizeValue(dottedName as DottedName, value),
        ])
      ) as Situation

      const cleanSituation = addToEngineSituation(situationToAdd)

      updateCurrentSimulation({
        situation: cleanSituation,
        foldedSteps: (current) => {
          // An answer can make a folded question inapplicable: drop it.
          const kept = current.filter((foldedStep) =>
            checkIfDottedNameShouldNotBeIgnored({
              dottedName: foldedStep,
              safeEvaluate,
              rawMissingVariables,
            })
          )
          if (
            questionDottedName !== undefined &&
            !kept.includes(questionDottedName)
          ) {
            kept.push(questionDottedName)
          }
          return kept
        },
      })
    },
    [
      addToEngineSituation,
      normalizeValue,
      updateCurrentSimulation,
      safeEvaluate,
      rawMissingVariables,
    ]
  )

  const setValue = useCallback(
    (
      dottedName: DottedName,
      value: NodeValue | Record<string, NodeValue>,
      options: SetValueOptions = {}
    ) => {
      if (!value || typeof value !== 'object') {
        applyPatch({ [dottedName]: value as NodeValue }, options)
        return
      }

      // A mosaic's composite is keyed by partial child names.
      applyPatch(
        Object.fromEntries(
          Object.entries(value).map(([partialChild, childValue]) => [
            utils.disambiguateReference(
              parsedRules ?? {},
              dottedName,
              partialChild
            ) as DottedName,
            childValue,
          ])
        ),
        options
      )
    },
    [applyPatch, parsedRules]
  )

  /** Fold a question without writing its value to the situation. */
  const foldQuestion = useCallback(
    ({ dottedName }: FoldQuestionOptions) => {
      updateCurrentSimulation({
        foldedSteps: (current) =>
          current.includes(dottedName) ? current : [...current, dottedName],
      })
    },
    [updateCurrentSimulation]
  )

  return { setValue, applyPatch, foldQuestion }
}
