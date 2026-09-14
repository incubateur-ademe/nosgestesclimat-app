import { createInstance, type i18n } from 'i18next'
import { initReactI18next } from 'react-i18next/initReactI18next'
import { getOptions } from './settings'
import { translations } from './translation'

const resources = Object.fromEntries(
  Object.entries(translations).map(([lng, bundle]) => [
    lng,
    { translation: bundle },
  ])
)

const instances = new Map<string, i18n>()

/**
 * Une seule instance par langue, initialisée de façon synchrone : les
 * traductions sont embarquées dans le bundle, il n'y a donc rien à attendre.
 *
 * L'`await` qui traînait ici rendait `async` chacun de ses appelants (et
 * `getServerTranslation` avec), donc autant de boundaries Suspense — et de
 * trous dynamiques dans le pré-rendu — pour une donnée disponible tout de
 * suite. On payait aussi une instance i18next par appel.
 */
const initI18next = (language: string) => {
  const cachedInstance = instances.get(language)

  if (cachedInstance) {
    return cachedInstance
  }

  const i18nInstance = createInstance()

  void i18nInstance.use(initReactI18next).init({
    ...getOptions(language),
    initImmediate: false,
    resources,
  })

  instances.set(language, i18nInstance)

  return i18nInstance
}

export default initI18next
