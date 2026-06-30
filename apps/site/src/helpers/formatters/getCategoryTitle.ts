import type { DottedName } from '@incubateur-ademe/nosgestesclimat'
import type { TFunction } from 'i18next'

interface Props {
  ruleTitle: string
  dottedName: DottedName
  t: TFunction
}

export function getCategoryTitle({ ruleTitle, dottedName, t }: Props) {
  return dottedName !== 'divers'
    ? ruleTitle
    : t('category.divers', 'Consommation')
}
