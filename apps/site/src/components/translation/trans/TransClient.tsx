'use client'

import { useClientTranslation } from '@/hooks/useClientTranslation'
import type { TransPropsWithInterpolation } from '@/types/translation'
import { type ReactElement } from 'react'
import { Trans as TransReactI18n } from 'react-i18next'

export default function Trans({
  children,
  i18nKey,
}: TransPropsWithInterpolation): ReactElement | null {
  const { t } = useClientTranslation()

  return (
    <TransReactI18n t={t} i18nKey={i18nKey}>
      {children}
    </TransReactI18n>
  )
}
