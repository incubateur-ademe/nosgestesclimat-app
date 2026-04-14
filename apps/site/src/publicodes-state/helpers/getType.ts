import type { DottedName, NGCRuleNode } from '@incubateur-ademe/nosgestesclimat'
import type { EvaluatedNode } from 'publicodes'

interface Props {
  dottedName: DottedName
  rule: NGCRuleNode | undefined
  evaluation: EvaluatedNode | null
}

const booleanSecureTypes = ['présent', 'propriétaire']

export default function getType({
  dottedName,
  rule,
  evaluation,
}: Props):
  | 'notQuestion'
  | 'numberMosaic'
  | 'selectMosaic'
  | 'choices'
  | 'boolean'
  | 'number'
  | undefined {
  if (!rule || !evaluation) return undefined

  if (!rule.rawNode.question) {
    return 'notQuestion'
  }

  if (rule.rawNode.mosaique?.type === 'selection') {
    return 'selectMosaic'
  }

  if (rule.rawNode.mosaique?.type === 'nombre') {
    return 'numberMosaic'
  }

  if (
    (rule.rawNode['unité'] === undefined &&
      typeof evaluation.nodeValue !== 'number') ||
    booleanSecureTypes.some((key) => dottedName.includes(key))
  ) {
    const unePossibilite = rule.rawNode['une possibilité']

    if (unePossibilite) {
      return 'choices'
    } else {
      return 'boolean'
    }
  }

  return 'number'
}
