import { ClientLayout } from '@/components/layout/ClientLayout'
import EngineProviders from '@/components/providers/EngineProviders'
import { noIndexObject } from '@/constants/metadata'
import { getServerTranslation } from '@/helpers/getServerTranslation'
import { getMetadataObject } from '@/helpers/metadata/getMetadataObject'
import { getUser } from '@/helpers/server/dal/user'
import { getSimulations } from '@/helpers/server/model/simulations'
import { FormProvider } from '@/publicodes-state'
import type { DottedName } from '@incubateur-ademe/nosgestesclimat'

export async function generateMetadata({
  params,
}: LayoutProps<'/[locale]/simulateur/[root]'>) {
  const { root, locale } = await params
  const { t } = await getServerTranslation({ locale })

  return getMetadataObject({
    locale,
    title: undefined,
    description: t(
      'Calculez votre empreinte sur le climat en 10 minutes chrono. Découvrez les gestes qui comptent vraiment pour le climat.'
    ),
    alternates: {
      canonical: `/simulateur/${root}`,
    },
    robots: noIndexObject,
  })
}

export default async function Layout({
  params,
  children,
}: LayoutProps<'/[locale]/simulateur/[root]'>) {
  const { root } = await params
  const { locale } = await params
  const user = await getUser()
  const serverSimulations = await getSimulations({ user }, { pageSize: 1 })
  return (
    <ClientLayout
      serverSimulations={serverSimulations}
      skipLinksDisplayed={new Set(['main', 'footer'])}
      locale={locale}
      serverUserId={user.id}>
      <EngineProviders>
        <FormProvider root={root as DottedName}>{children}</FormProvider>
      </EngineProviders>
    </ClientLayout>
  )
}
