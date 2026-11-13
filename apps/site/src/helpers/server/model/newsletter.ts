'use server'

import { NEWSLETTER_URL, USER_URL } from '@/constants/urls/main'
import { getT } from '@/helpers/getServerTranslation'
import { NotFoundError } from '@/helpers/server/error'
import i18nConfig from '@/i18nConfig'
import initI18next from '@/locales/initServer'
import { isLocale } from '@/utils/is-locale'
import { fetchServer } from '../fetchServer'

export async function updateNewsletterSubscription({
  email,
  listIds,
}: {
  email: string
  listIds: ListIds
}): Promise<void> {
  await fetchServer(`${NEWSLETTER_URL}/inscription`, {
    method: 'POST',
    body: {
      email,
      listIds,
    },
  })
}

/**
 * The newsletters the user is subscribed to. The API answers 404 when Brevo
 * holds no contact for them: no subscription, not a missing user.
 */
export async function getNewsletterSubscriptions(email: string) {
  try {
    return await fetchServer<{ email: string; listIds: ListIds }>(
      `${USER_URL}/me/contact`
    )
  } catch (error) {
    if (error instanceof NotFoundError) {
      return { email, listIds: [] }
    }
    throw error
  }
}

export enum NEWSLETTER_IDS {
  ACTU = 22,
  TRANSPORT = 32,
  HOUSING = 36,
  ALIMENTATION = 41,
}

export type Newsletters = Awaited<ReturnType<typeof getNewsletters>>
export type ListIds = NEWSLETTER_IDS[]

// Un module `'use server'` n'expose que des fonctions async, même sans `await`
// à faire :
// eslint-disable-next-line @typescript-eslint/require-await
export async function getNewsletters({ locale }: { locale: string }) {
  const resolvedLocale = isLocale(locale) ? locale : i18nConfig.defaultLocale
  const t = getT({
    locale: resolvedLocale,
    i18nextInstance: initI18next(resolvedLocale),
  })
  return [
    {
      brevoId: NEWSLETTER_IDS.ACTU,
      title: t(
        'newsletterManagement.mainNewsletter.title',
        'Les actualités de Nos Gestes Climat'
      ),
      emoji: '🌱',
      description: t(
        'newsletterManagement.mainNewsletter.description',
        "Nos dernières évolutions et nos recommandations d'actions, les articles récents, les contenus du moment, et plus encore. Une fois par mois."
      ),
      id: 'newsletter-actu',
    },
    {
      brevoId: NEWSLETTER_IDS.TRANSPORT,
      title: t(
        'newsletterManagement.transportNewsletter.title',
        'Nos Gestes Transports'
      ),
      emoji: '🚗',
      description: t(
        'newsletterManagement.transportNewsletter.description',
        "4 infolettres (sur 4 semaines), pour comprendre l'impact de nos déplacements et agir concrètement. Pour avancer vers des trajets plus légers."
      ),
      id: 'newsletter-transports',
    },
    {
      brevoId: NEWSLETTER_IDS.HOUSING,
      title: t(
        'newsletterManagement.logementNewsletter.title',
        'Nos Gestes Logement'
      ),
      emoji: '🏠',
      description: t(
        'newsletterManagement.logementNewsletter.description',
        "3 infolettres (sur 3 semaines), pour découvrir comment nos choix d'habitat influencent notre empreinte carbone. Pour un logement plus sobre et confortable."
      ),
      id: 'newsletter-logement',
    },
    {
      brevoId: NEWSLETTER_IDS.ALIMENTATION,
      title: t(
        'newsletterManagement.alimentationNewsletter.title',
        'Nos Gestes Alimentation'
      ),
      emoji: '🍎',
      description: t(
        'newsletterManagement.alimentationNewsletter.description',
        "4 infolettres (sur 4 semaines), pour découvrir l'empreinte de notre alimentation, et comprendre comment aligner son assiette avec les enjeux planétaires."
      ),
      id: 'newsletter-alimentation',
    },
  ] as const
}
