import initI18next from '@/locales/initServer'

export async function getServerTranslation(
  params: { locale: string } | Promise<{ locale: string }>,
  namespace?: string,
  options?: { keyPrefix: string }
) {
  const resolvedParams = await params
  const locale = resolvedParams.locale

  const i18nextInstance = await initI18next(locale)

  i18nextInstance.getFixedT(locale, 'translation', options?.keyPrefix ?? '')

  return {
    t: i18nextInstance.getFixedT(
      locale,
      Array.isArray(namespace) ? namespace[0] : namespace,
      options?.keyPrefix ?? ''
    ),
    i18n: i18nextInstance,
  }
}
