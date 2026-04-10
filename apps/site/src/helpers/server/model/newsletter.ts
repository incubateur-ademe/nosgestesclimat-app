'use server'

import { NEWSLETTER_URL, USER_URL } from '@/constants/urls/main'
import { getServerTranslation } from '@/helpers/getServerTranslation'
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

export async function getNewsletterSubscriptions() {
  return await fetchServer<{ email: string; listIds: ListIds }>(
    `${USER_URL}/me/contact`
  )
}

export enum NEWSLETTER_IDS {
  ACTU = 22,
  TRANSPORT = 32,
  HOUSING = 36,
  ALIMENTATION = 41,
}

export type Newsletters = Awaited<ReturnType<typeof getNewsletters>>
export type ListIds = NEWSLETTER_IDS[]

export async function getNewsletters({ locale }: { locale: string }) {
  const { t } = await getServerTranslation({ locale })
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
