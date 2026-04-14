import type { Engine, Entries, ParsedRules } from '@/publicodes-state/types'
import type { MissingVariables } from '@/publicodes-state/types.d'
import type { DottedName, NGCRuleNode } from '@incubateur-ademe/nosgestesclimat'
import { utils } from 'publicodes'
import { useMemo } from 'react'

interface Props {
  engine?: Engine
  root: DottedName
}

export function useRules({ engine, root }: Props) {
  const parsedRules = useMemo(() => engine?.getParsedRules(), [engine])

  const parsedRulesEntries = useMemo(
    () => Object.entries(parsedRules || {}) as Entries<ParsedRules>,
    [parsedRules]
  )

  const everyRules = useMemo(
    () => parsedRulesEntries.map((rule) => rule[0]),
    [parsedRulesEntries]
  )

  const everyInactiveRules = useMemo(
    () =>
      parsedRulesEntries
        .filter((rule) => rule[1].rawNode.inactif === 'oui')
        .map((rule) => rule[0]),
    [parsedRulesEntries]
  )

  const everyQuestions = useMemo(
    () =>
      parsedRulesEntries
        .filter((rule) => rule[1].rawNode.question)
        .map((question) => question[0]),
    [parsedRulesEntries]
  )

  const everyNotifications = useMemo(
    () =>
      parsedRulesEntries
        .filter((rule) => rule[1].rawNode.type === 'notification')
        .map((question) => question[0]),
    [parsedRulesEntries]
  )

  const everyUiCategories = useMemo(
    () =>
      parsedRulesEntries
        .filter((rule) => rule[0].includes('ui . pédagogie'))
        .filter((rule) => !rule[1].rawNode['cachée'])
        .map((question) => question[0]),
    [parsedRulesEntries]
  )

  const everyMosaic = useMemo<DottedName[]>(
    () =>
      parsedRulesEntries
        .filter((rule) => rule[1].rawNode.mosaique)
        .map((question) => question[0]),
    [parsedRulesEntries]
  )

  const everyMosaicChildrenWithParent = useMemo(
    () =>
      everyMosaic.reduce<Record<DottedName, DottedName[]>>(
        (accumulator, mosaic) => {
          const mosaicRule = engine?.getRule(mosaic) as NGCRuleNode

          if (!mosaicRule.rawNode.mosaique) {
            return accumulator
          }
          const mosaicChildren = mosaicRule.rawNode.mosaique.options?.map(
            (option: string) => {
              return utils.disambiguateReference(
                parsedRules || {},
                mosaic,
                option
              )
            }
          )
          accumulator[mosaic] = [...mosaicChildren]
          return accumulator
        },
        {} as Record<DottedName, DottedName[]>
      ),
    [everyMosaic, engine, parsedRules]
  )

  const rawMissingVariables = useMemo(() => {
    const MissingVariablesEntries = Object.entries(
      engine?.evaluate(root)?.missingVariables || {}
    ) as Entries<MissingVariables>

    // We only keep missing variables that are questions and have no condition
    const filteredMissingVariablesEntries = MissingVariablesEntries.filter(
      ([missingVariableKey]) => {
        return (
          everyQuestions.includes(missingVariableKey) &&
          parsedRules?.[missingVariableKey].explanation.valeur.rawNode?.[
            'applicable si'
          ] === undefined &&
          parsedRules?.[missingVariableKey].explanation.valeur.rawNode?.[
            'non applicable si'
          ] === undefined
        )
      }
    )

    return Object.fromEntries(
      filteredMissingVariablesEntries
    ) as MissingVariables
  }, [engine, everyQuestions, parsedRules, root])

  return {
    parsedRules,
    everyRules,
    everyInactiveRules,
    everyQuestions,
    everyNotifications,
    everyUiCategories,
    everyMosaicChildrenWithParent,
    rawMissingVariables,
  }
}
