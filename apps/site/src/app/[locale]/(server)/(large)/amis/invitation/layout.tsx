import QueryClientProviderWrapper from '@/app/[locale]/_components/mainLayoutProviders/QueryClientProviderWrapper'
import { t } from '@/helpers/metadata/fakeMetadataT'
import { getCommonMetadata } from '@/helpers/metadata/getCommonMetadata'
import type { PropsWithChildren } from 'react'

export const generateMetadata = getCommonMetadata({
  title: t('Rejoindre un groupe - Nos Gestes Climat'),
  description: t(
    "Rejoignez votre groupe pour calculez votre empreinte carbone et la comparer avec l'empreinte de vos proches grâce au calculateur de bilan carbone personnel Nos Gestes Climat."
  ),
  alternates: {
    canonical: '/amis/invitation',
  },
})

export default function SimulateurLayout({ children }: PropsWithChildren) {
  return <QueryClientProviderWrapper>{children}</QueryClientProviderWrapper>
}
