import type {
  Engine,
  Entries,
  SafeEvaluate,
  Situation,
} from '@/publicodes-state/types'
import type { DottedName, NGCRuleNode } from '@incubateur-ademe/nosgestesclimat'
import { fixSituationWithPartialMosaic } from './fixSituationWithPartialMosaic'

interface Props {
  situation: Situation
  everyMosaicChildrenWithParent: Record<DottedName, DottedName[]>
  everyQuestions: DottedName[]
  everyRules: DottedName[]
  engine: Engine | null
  safeGetRule: (rule: DottedName) => NGCRuleNode | undefined
  safeEvaluate: SafeEvaluate
}

export const getPersonaFoldedSteps = ({
  situation,
  everyMosaicChildrenWithParent,
  everyQuestions,
  engine,
  safeGetRule,
  safeEvaluate,
}: Props): string[] => {
  if (engine === null) return []

  const personaSituation = fixSituationWithPartialMosaic({
    situation,
    everyMosaicChildrenWithParent,
    safeGetRule,
    safeEvaluate,
  })

  engine.setSituation(personaSituation)

  // The current engine situation might have been filtered
  const safeSituation = engine.getSituation()

  // The persona folded steps are obtained by getting the missing variables and the situation variables.
  const personaFoldedSteps = [
    ...Object.keys(engine.evaluate('bilan')?.missingVariables || {}).filter(
      (missingVariable) =>
        everyQuestions.includes(missingVariable as DottedName)
    ),
    ...Object.keys(safeSituation),
  ] as DottedName[]

  // Then, for each mosaic in the model, we remove all mosaic children and replace it with the rule mosaic itself
  // as we need the parent rule in the folded steps and not the children.
  // If we don't find any mosaic children for a given mosaic, we don't do anything.
  ;(
    Object.entries(everyMosaicChildrenWithParent) as Entries<
      typeof everyMosaicChildrenWithParent
    >
  ).forEach(([mosaicParent, expectedMosaicGroup]) => {
    let isMosaicInSituation = false

    expectedMosaicGroup.forEach((dottedName) => {
      const index = personaFoldedSteps.indexOf(dottedName)
      if (index > -1) {
        personaFoldedSteps.splice(index, 1)
        isMosaicInSituation = true
      }
    })

    if (isMosaicInSituation) {
      personaFoldedSteps.push(mosaicParent)
    }
  })

  return personaFoldedSteps
}
