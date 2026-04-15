import HeaderServer from '@/components/layout/HeaderServer'
import { noIndexObject } from '@/constants/metadata'
import { t } from '@/helpers/metadata/fakeMetadataT'
import { getCommonMetadata } from '@/helpers/metadata/getCommonMetadata'
import type { PropsWithChildren } from 'react'

export const generateMetadata = getCommonMetadata({
  title: t('Tutoriel du calculateur - Nos Gestes Climat'),
  description: t(
    'Comprenez comment calculer votre empreinte sur le climat en 10min chrono.'
  ),
  alternates: { canonical: '/tutoriel' },
  robots: noIndexObject,
})

export default async function TutorielLayout({
  children,
  params,
}: PropsWithChildren<LayoutProps<'/[locale]/tutoriel'>>) {
  const { locale } = await params
  return (
    <>
      <HeaderServer locale={locale} />
      {children}
    </>
  )
}
