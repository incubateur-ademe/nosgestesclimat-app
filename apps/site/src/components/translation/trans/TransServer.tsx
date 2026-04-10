import { getServerTranslation } from '@/helpers/getServerTranslation'
import type { TransPropsWithInterpolation } from '@/types/translation'
import type { ReactElement } from 'react'
import { Trans as TransReactI18n } from 'react-i18next/TransWithoutContext'
export default async function Trans({
  locale,
  children,
  i18nKey,
  values,
}: TransPropsWithInterpolation & { locale: string }): Promise<ReactElement> {
  const { t } = await getServerTranslation({ locale })

  return (
    <TransReactI18n i18nKey={i18nKey} t={t} values={values}>
      {children}
    </TransReactI18n>
  )
}
