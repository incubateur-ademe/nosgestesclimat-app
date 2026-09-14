import initI18next from '@/locales/initServer'

/**
 * Synchrone à dessein : les traductions sont embarquées dans le bundle.
 * En faire un `await` transformait chaque composant qui affiche du texte en
 * composant asynchrone, donc en boundary Suspense (et en trou dynamique du
 * pré-rendu), pour une donnée immédiatement disponible.
 */
export function getServerTranslation(
  params: { locale: string },
  namespace?: string,
  options?: { keyPrefix: string }
) {
  const { locale } = params

  const i18nextInstance = initI18next(locale)

  return {
    t: i18nextInstance.getFixedT(
      locale,
      Array.isArray(namespace) ? namespace[0] : namespace,
      options?.keyPrefix ?? ''
    ),
    i18n: i18nextInstance,
  }
}
