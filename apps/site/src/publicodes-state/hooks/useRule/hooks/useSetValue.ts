'use client'

import { checkIfDottedNameShouldNotBeIgnored } from '@/publicodes-state/helpers/checkIfDottedNameShouldNotBeIgnored'
import getType from '@/publicodes-state/helpers/getType'

import type {
  MissingVariables,
  ParsedRules,
  SafeEvaluate,
  Situation,
  UpdateCurrentSimulationProps,
} from '@/publicodes-state/types'
import type {
  DottedName,
  NGCRuleNode,
  NodeValue,
} from '@incubateur-ademe/nosgestesclimat'
import type { EvaluatedNode } from 'publicodes'
import { utils } from 'publicodes'
import { useCallback } from 'react'

interface Props {
  dottedName: DottedName
  parsedRules: ParsedRules | undefined
  safeGetRule: (rule: DottedName) => NGCRuleNode | undefined
  safeEvaluate: SafeEvaluate
  evaluation: EvaluatedNode | null
  type: string | undefined
  updateCurrentSimulation: (simulation: UpdateCurrentSimulationProps) => void
  addToEngineSituation: (situationToAdd: Situation) => Situation
  foldedSteps: DottedName[]
  rawMissingVariables: MissingVariables
}

export default function useSetValue({
  dottedName,
  parsedRules,
  safeGetRule,
  safeEvaluate,
  type,
  updateCurrentSimulation,
  addToEngineSituation,
  foldedSteps,
  rawMissingVariables,
}: Props) {
  /**
   * @param value - The value to set
   * @param options.questionDottedName - The dottedName to be folded
   */
  const setValue = useCallback(
    (
      value: NodeValue | Record<string, NodeValue>,
      {
        questionDottedName,
      }: {
        questionDottedName?: DottedName
      } = {}
    ) => {
      let situationToAdd = {}

      if (value && typeof value === 'object') {
        situationToAdd = Object.keys(value || {}).reduce(
          (accumulator: Situation, partialMosaicChildDottedName: string) => {
            const mosaicChildDottedName = utils.disambiguateReference(
              parsedRules ?? {},
              dottedName,
              partialMosaicChildDottedName
            ) as DottedName
            const rule = safeGetRule(mosaicChildDottedName)
            const evaluation = safeEvaluate(mosaicChildDottedName)
            return {
              ...accumulator,
              [mosaicChildDottedName]: checkValueValidity({
                value: value[partialMosaicChildDottedName],
                type: getType({
                  rule,
                  evaluation,
                  dottedName: mosaicChildDottedName,
                }),
              }),
            } as Situation
          },
          {} as Situation
        )
      } else {
        situationToAdd = {
          [dottedName]: checkValueValidity({ value, type }),
        }
      }

      const safeAndCleanSituation = addToEngineSituation(situationToAdd)

      const cleanFoldedSteps = foldedSteps.filter((foldedStep) => {
        return checkIfDottedNameShouldNotBeIgnored({
          dottedName: foldedStep,
          safeEvaluate,
          rawMissingVariables,
        })
      })

      if (
        questionDottedName !== undefined &&
        !cleanFoldedSteps.includes(questionDottedName)
      ) {
        cleanFoldedSteps.push(questionDottedName)
      }

      updateCurrentSimulation({
        situation: safeAndCleanSituation,
        foldedSteps: cleanFoldedSteps,
      })
    },
    [
      addToEngineSituation,
      foldedSteps,
      updateCurrentSimulation,
      parsedRules,
      dottedName,
      safeGetRule,
      safeEvaluate,
      type,
      rawMissingVariables,
    ]
  )

  return {
    setValue,
  }
}

const checkValueValidity = ({
  value,
  type,
}: {
  value: unknown
  type: string | undefined
}): NodeValue => {
  switch (type) {
    case 'choices': {
      if (value === null) {
        return
      }
      if (value === undefined) {
        return "''"
      }
      const stringValue = typeof value === 'string' ? value : String(value)
      return stringValue?.startsWith("'") ? stringValue : `'${stringValue}'`
    }
    case 'boolean':
      if (value === 'oui' || value === true) {
        return 'oui'
      }
      if (value === 'non' || value === false || value === null) {
        return 'non'
      }
      return undefined
    case 'numberMosaic':
    case 'selectMosaic':
      return 'mosaic'
    case 'number':
      return value === undefined
        ? undefined
        : typeof value === 'number'
          ? value
          : 0
    default:
      return !value ? 0 : (value as NodeValue)
  }
}
