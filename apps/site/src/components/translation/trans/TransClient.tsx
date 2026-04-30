'use client'

import { useClientTranslation } from '@/hooks/useClientTranslation'
import type { TransPropsWithInterpolation } from '@/types/translation'
import { type ReactElement } from 'react'
import { Trans as TransReactI18n } from 'react-i18next'

export default function Trans({
  children,
  i18nKey,
  values,
}: TransPropsWithInterpolation): ReactElement | null {
  const { t } = useClientTranslation()

  return (
    <TransReactI18n t={t} i18nKey={i18nKey} values={values}>
      {children}
    </TransReactI18n>
  )
}
