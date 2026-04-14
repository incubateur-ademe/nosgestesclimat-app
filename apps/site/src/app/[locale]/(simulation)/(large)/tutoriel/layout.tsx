import { noIndexObject } from '@/constants/metadata'
import { t } from '@/helpers/metadata/fakeMetadataT'
import { getCommonMetadata } from '@/helpers/metadata/getCommonMetadata'

export const generateMetadata = getCommonMetadata({
  title: t('Tutoriel du calculateur - Nos Gestes Climat'),
  description: t(
    'Comprenez comment calculer votre empreinte sur le climat en 10min chrono.'
  ),
  alternates: { canonical: '/tutoriel' },
  robots: noIndexObject,
})

export default function TutorielLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <div>{children}</div>
}
