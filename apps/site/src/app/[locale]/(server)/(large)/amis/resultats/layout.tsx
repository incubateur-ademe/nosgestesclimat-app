import EngineProviders from '@/components/providers/EngineProviders'
import { t } from '@/helpers/metadata/fakeMetadataT'
import { getCommonMetadata } from '@/helpers/metadata/getCommonMetadata'
import type { PropsWithChildren } from 'react'

export const generateMetadata = getCommonMetadata({
  title: t('Mon groupe - Nos Gestes Climat'),
  description: t(
    "Calculez votre empreinte carbone en groupe et comparez la avec l'empreinte de vos proches grâce au calculateur de bilan carbone personnel Nos Gestes Climat."
  ),
  alternates: {
    canonical: '/amis/resultats',
  },
})

export default function Layout({ children }: PropsWithChildren) {
  return <EngineProviders>{children}</EngineProviders>
}
