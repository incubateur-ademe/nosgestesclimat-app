'use client'

import { languages } from '@/constants/localisation/translation'
import { safeSessionStorage } from '@/utils/browser/safeSessionStorage'
import i18next from 'i18next'
import { initReactI18next } from 'react-i18next'
import { getOptions } from './settings'
import { translations } from './translation'

const getLanguage = () => {
  if (typeof window === 'undefined') return 'fr'

  // 1. Try to get locale from URL search param (most explicit, used by iframe integrators)
  const searchParams = new URLSearchParams(window.location.search)
  const urlParamLocale = searchParams.get('lang')
  if (urlParamLocale && languages.includes(urlParamLocale)) {
    return urlParamLocale
  }

  // 2. Try to get locale from URL pathname prefix
  const pathname = window.location.pathname
  const pathParts = pathname.split('/')
  const pathLocale = pathParts[1]
  if (pathLocale && languages.includes(pathLocale)) {
    return pathLocale
  }

  // 3. Try to get locale from sessionStorage (useful in iframes where cookies are blocked)
  const iframeLang = safeSessionStorage.getItem('ngc-iframe-lang')
  if (iframeLang && languages.includes(iframeLang)) {
    return iframeLang
  }

  // 4. Try to get locale from NEXT_LOCALE cookie
  const cookie = document.cookie
  const match = /NEXT_LOCALE=([^;]+)/.exec(cookie)
  const cookieLocale = match ? match[1] : null
  if (cookieLocale && languages.includes(cookieLocale)) {
    return cookieLocale
  }

  return 'fr'
}

void i18next.use(initReactI18next).init({
  ...getOptions(),
  lng: getLanguage(),
  resources: {
    en: {
      translation: translations.en,
    },
    fr: {
      translation: translations.fr,
    },
  },
})
