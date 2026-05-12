import QueryClientProviderWrapper from '@/app/[locale]/_components/mainLayoutProviders/QueryClientProviderWrapper'
import { noIndexObject } from '@/constants/metadata'
import { AGE_PAGE_PATH } from '@/constants/urls/paths'
import { t } from '@/helpers/metadata/fakeMetadataT'
import { getCommonMetadata } from '@/helpers/metadata/getCommonMetadata'
import type { PropsWithChildren } from 'react'

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

export default function Layout({ children }: PropsWithChildren) {
  return <QueryClientProviderWrapper>{children}</QueryClientProviderWrapper>
}
