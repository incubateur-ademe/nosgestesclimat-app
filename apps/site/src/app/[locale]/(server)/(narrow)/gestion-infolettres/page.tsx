import NewsletterForm from '@/app/[locale]/(server)/(narrow)/gestion-infolettres/_components/NewsletterForm'
import { MON_ESPACE_SETTINGS_PATH } from '@/constants/urls/paths'
import Title from '@/design-system/layout/Title'
import { getServerTranslation } from '@/helpers/getServerTranslation'
import { getNewsletters } from '@/helpers/server/model/newsletter'
import { isUserAuthenticated } from '@/helpers/server/model/user'
import type { Locale } from '@/i18nConfig'
import { redirect } from 'next/navigation'

import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Gestion des infolettres - Nos Gestes Climat',
  description:
    'Gérez vos abonnements aux infolettres Nos Gestes Climat. Sélectionnez les newsletters qui vous intéressent pour recevoir des conseils personnalisés sur la réduction de votre empreinte carbone.',
}

export default async function NewsletterManagementPage({
  params,
}: {
  params: Promise<{ locale: Locale }>
}) {
  if (await isUserAuthenticated()) {
    redirect(`${MON_ESPACE_SETTINGS_PATH}#infolettres`)
  }
  const { locale } = await params
  const [{ t }, newsletters] = await Promise.all([
    getServerTranslation({ locale }),
    getNewsletters({ locale }),
  ])

  return (
    <div className="mb-12">
      <Title
        title={t(
          'newsletterManagement.title',
          'Sélectionnez les infolettres qui vous intéressent'
        )}
      />

      <NewsletterForm newsletters={newsletters} />
    </div>
  )
}
