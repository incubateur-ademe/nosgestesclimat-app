import { t } from '@/helpers/metadata/fakeMetadataT'
import { getCommonMetadata } from '@/helpers/metadata/getCommonMetadata'
import type { PropsWithChildren } from 'react'

export const generateMetadata = getCommonMetadata({
  title: t('Supprimer mes données de groupe - Nos Gestes Climat'),
  description: t(
    'Supprimez vos données de groupe enregistrées dans le calculateur Nos Gestes Climat.'
  ),
  alternates: {
    canonical: '/amis/supprimer',
  },
})

export default function Layout({
  children,
}: PropsWithChildren<{ params: { root: string } }>) {
  return <>{children}</>
}
