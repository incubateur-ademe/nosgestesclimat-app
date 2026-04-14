import type { DottedName } from '@incubateur-ademe/nosgestesclimat'
import type { MissingVariables, SafeEvaluate } from '../types'

interface Props {
  dottedName: DottedName
  safeEvaluate: SafeEvaluate
  rawMissingVariables: MissingVariables
}

export const checkIfDottedNameShouldNotBeIgnored = ({
  dottedName,
  safeEvaluate,
  rawMissingVariables,
}: Props) => {
  const isApplicable =
    safeEvaluate({ 'est applicable': dottedName })?.nodeValue === true

  const isRawInMissingVariables =
    Object.keys(rawMissingVariables).includes(dottedName)
  // even if the question is disabled, we want to display it if it's a missing variable
  // (this is the case for boolean question whose value is a condition for the parent).
  // TODO: if a foldedStep is applicable but not in missing variables (not raw), it won't be ignored, even if it should be.
  return isRawInMissingVariables || isApplicable
}
