'use client'

import { updateLangCookie } from '@/helpers/language/updateLangCookie'
import { useLocale } from '@/hooks/useLocale'
import { useEffect } from 'react'

export function useSyncLocaleCookie() {
  const locale = useLocale()

  useEffect(() => {
    if (
      locale &&
      !document.cookie.includes(`NEXT_LOCALE=${locale}`)
    ) {
      updateLangCookie(locale)
    }
  }, [locale])
}
