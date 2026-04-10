import type { DottedName } from '@incubateur-ademe/nosgestesclimat'
import type { Situation } from '../types'

interface Props {
  dottedName: DottedName
  situation: Situation
  questionsOfMosaicFromParent?: DottedName[]
}

export default function getIsMissing({
  dottedName,
  situation,
  questionsOfMosaicFromParent = [],
}: Props): boolean {
  if (situation[dottedName] || situation[dottedName] === 0) {
    return false
  }
  if (
    questionsOfMosaicFromParent.find(
      (question) => situation[question] || situation[question] === 0
    )
  ) {
    return false
  }
  return true
}
