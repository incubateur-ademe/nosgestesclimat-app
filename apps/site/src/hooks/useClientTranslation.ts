'use client'

import '@/locales/initClient'
import { useTranslation } from 'react-i18next'
import { useLocale } from './useLocale'

export function useClientTranslation(): ReturnType<typeof useTranslation> {
  const locale = useLocale()

  const transObject = useTranslation('translation', {
    lng: locale,
  })

  return transObject
}
