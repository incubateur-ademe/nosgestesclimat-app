import EngineProviders from '@/components/providers/EngineProviders'
import { t } from '@/helpers/metadata/fakeMetadataT'
import { getCommonMetadata } from '@/helpers/metadata/getCommonMetadata'
import type { PropsWithChildren } from 'react'

export const generateMetadata = getCommonMetadata({
  title: t("Nos personas d'utilisateurs types - Nos Gestes Climat"),
  description: t(
    "Découvrez les personas d'utilisateurs types qui nous servent à tester le calculateur sous toutes ses coutures."
  ),
  alternates: {
    canonical: '/personas',
  },
})

export default function PersonasLayout({ children }: PropsWithChildren) {
  return <EngineProviders>{children}</EngineProviders>
}
