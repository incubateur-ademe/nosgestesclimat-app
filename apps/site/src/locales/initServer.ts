import { createInstance } from 'i18next'
import { initReactI18next } from 'react-i18next/initReactI18next'
import { getOptions } from './settings'
import { translations } from './translation'

const initI18next = async (language: string) => {
  const i18nInstance = createInstance()

  await i18nInstance.use(initReactI18next).init({
    ...getOptions(language),
    resources: Object.fromEntries(
      Object.entries(translations).map(([lng, bundle]) => [
        lng,
        { translation: bundle },
      ])
    ),
  })

  return i18nInstance
}

export default initI18next
