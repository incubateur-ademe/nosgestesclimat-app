import { t } from '@/helpers/metadata/fakeMetadataT'
import { getCommonMetadata } from '@/helpers/metadata/getCommonMetadata'

export const generateMetadata = getCommonMetadata({
  title: t('Mon espace - Nos Gestes Climat'),
  description: t(
    'Connectez-vous à votre espace Nos Gestes Climat pour accéder à vos résultats et comparer vos empreintes carbone avec vos proches.'
  ),
})

export default function MonEspaceLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
