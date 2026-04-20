import { t } from '@/helpers/metadata/fakeMetadataT'
import { getCommonMetadata } from '@/helpers/metadata/getCommonMetadata'
import type { PropsWithChildren } from 'react'

export const generateMetadata = getCommonMetadata({
  title: t('Organisations, accéder à mon espace - Nos Gestes Climat'),
  description: t(
    'Accédez à des services sur mesure pour sensibiliser vos partenaires au sein de votre organisation.'
  ),
  alternates: {
    canonical: '/organisations/connexion',
  },
})

export default function Layout({ children }: PropsWithChildren) {
  return <>{children}</>
}
