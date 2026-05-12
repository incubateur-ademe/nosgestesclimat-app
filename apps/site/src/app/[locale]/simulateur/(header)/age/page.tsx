import QueryClientProviderWrapper from '@/app/[locale]/_components/mainLayoutProviders/QueryClientProviderWrapper'
import Trans from '@/components/translation/trans/TransServer'
import { noIndexObject } from '@/constants/metadata'
import { AGE_PAGE_PATH, SIMULATOR_PATH } from '@/constants/urls/paths'
import Title from '@/design-system/layout/Title'
import { t } from '@/helpers/metadata/fakeMetadataT'
import { getCommonMetadata } from '@/helpers/metadata/getCommonMetadata'
import { getUser } from '@/helpers/server/dal/user'
import { UserProvider } from '@/publicodes-state'
import { redirect } from 'next/navigation'
import AgeForm from './_components/AgeForm'

export const generateMetadata = getCommonMetadata({
  title: t('Pour mieux vous connaitre - Nos Gestes Climat'),
  description: t(
    'Une première question avant de calculer votre empreinte sur le climat.'
  ),
  alternates: {
    canonical: AGE_PAGE_PATH,
  },
  robots: noIndexObject,
})

export default async function AgePage({
  params,
}: PageProps<'/[locale]/simulateur/age'>) {
  const { locale } = await params

  const user = await getUser()

  if ('ageRange' in user && !!user.ageRange) {
    redirect(SIMULATOR_PATH)
  }

  return (
    <>
      <Title
        data-testid="tutoriel-title"
        className="mt-10 text-lg md:text-2xl"
        title={
          <span>
            <Trans i18nKey="simulator.age.title" locale={locale}>
              On commence par vous, quel est votre âge ?
            </Trans>
            <span className="text-secondary-700 ml-2 inline-block text-base font-bold">
              <Trans i18nKey="common.facultatif.uppercase" locale={locale}>
                Facultatif
              </Trans>
            </span>
          </span>
        }
        subtitle={
          <>
            <Trans i18nKey="simulator.age.subtitle" locale={locale}>
              Nous cherchons à mieux connaître nos participants au test à des
              fins statistiques.
            </Trans>
          </>
        }
      />
      <UserProvider serverUserId={user.id}>
        <QueryClientProviderWrapper>
          <AgeForm />
        </QueryClientProviderWrapper>
      </UserProvider>
    </>
  )
}
