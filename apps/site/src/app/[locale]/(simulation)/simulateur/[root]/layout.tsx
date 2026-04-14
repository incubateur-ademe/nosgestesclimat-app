import { noIndexObject } from '@/constants/metadata'
import { getServerTranslation } from '@/helpers/getServerTranslation'
import { getMetadataObject } from '@/helpers/metadata/getMetadataObject'
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
  return <FormProvider root={root as DottedName}>{children}</FormProvider>
}
