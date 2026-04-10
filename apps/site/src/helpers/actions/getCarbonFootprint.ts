import { getCurrentLangInfos } from '@/locales/translation'
import type { TranslationFunctionType } from '@/types/translation'
import type { NodeValue } from '@incubateur-ademe/nosgestesclimat'

const getRawUnitDigitsArray = ({
  value,
  isConcise,
  t,
}: {
  value: number
  isConcise: boolean
  t: TranslationFunctionType
}): [number, string, number] => {
  switch (true) {
    case value === 0:
      return [value, '', 0]
    case value < 1:
      return [value * 1000, 'g', 1]
    case value < 1000:
      return [value, 'kg', 0]
    default:
      return [
        value / 1000,
        isConcise
          ? 't'
          : value > 2000
            ? (t('tonnes') as string)
            : (t('tonne') as string),
        1,
      ]
  }
}

import type { i18n as I18nType } from 'i18next'

export const getCarbonFootprint = (
  { t, i18n }: { t: TranslationFunctionType; i18n: I18nType }, // We need to be passed as an argument instead of calling useTranslation inside the body, to avoid 'Rendered more hooks than during the previous render.'
  possiblyNegativeValue: NodeValue,
  isConcise = false,
  noSign?: boolean
): [string, string] => {
  const rawValue = Math.abs(Number(possiblyNegativeValue))

  const [raw, unit, digits] = getRawUnitDigitsArray({
    value: rawValue,
    isConcise,
    t,
  })

  const abrvLocale = getCurrentLangInfos(i18n).abrvLocale

  const signedValue = raw * (Number(possiblyNegativeValue) < 0 ? -1 : 1)
  const resultValue = noSign ? raw : signedValue

  const value: string = resultValue.toLocaleString(abrvLocale, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })

  return [value, unit]
}
