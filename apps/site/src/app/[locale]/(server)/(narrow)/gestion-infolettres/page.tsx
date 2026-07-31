import NewsletterForm from '@/app/[locale]/(server)/(narrow)/gestion-infolettres/_components/NewsletterForm'
import { MON_ESPACE_SETTINGS_PATH } from '@/constants/urls/paths'
import Title from '@/design-system/layout/Title'
import { getServerTranslation } from '@/helpers/getServerTranslation'
import { getNewsletters } from '@/helpers/server/model/newsletter'
import type { Locale } from '@/i18nConfig'
import { redirect } from 'next/navigation'

import { t } from '@/helpers/metadata/fakeMetadataT'
import { getCommonMetadata } from '@/helpers/metadata/getCommonMetadata'
import { getUserSession } from '@/services/auth/get-user-session'

export const generateMetadata = getCommonMetadata({
  title: t('Gestion des infolettres - Nos Gestes Climat'),
  description: t(
    'Gérez vos abonnements aux infolettres Nos Gestes Climat. Sélectionnez les newsletters qui vous intéressent pour recevoir des conseils personnalisés sur la réduction de votre empreinte carbone.'
  ),
  alternates: {
    canonical: '/gestion-infolettres',
  },
})

export default async function NewsletterManagementPage({
  params,
}: {
  params: Promise<{ locale: Locale }>
}) {
  if ((await getUserSession())?.isAuth) {
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
