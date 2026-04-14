import { useEngine } from '@/publicodes-state'
import type { DottedName } from '@incubateur-ademe/nosgestesclimat'

const QUESTIONS_TO_CHECK_APPLICABILITY: DottedName[] = [
  'logement . chauffage . appoint . électricité . présent',
  'logement . chauffage . appoint . bois . présent',
  'logement . chauffage . bois . système . chaudière bûches . présent',
  'logement . chauffage . bois . système . chaudière granulés . présent',
]

export function useIsNotApplicableHack(question: DottedName): boolean {
  const { safeEvaluate } = useEngine()

  if (!QUESTIONS_TO_CHECK_APPLICABILITY.includes(question)) {
    return false
  }

  return safeEvaluate({ 'est non applicable': question })?.nodeValue === true
}
