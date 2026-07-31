import { buildAlternates } from '@/helpers/metadata/getMetadataObject'
import type { Locale } from '@/i18nConfig'
import type { Metadata } from 'next'
import SimulateurLayout from './_components/SimulateurLayout'

export async function generateMetadata({
  params,
}: LayoutProps<'/[locale]/simulateur/bilan'>): Promise<Metadata> {
  const { locale } = await params

  return {
    alternates: buildAlternates({
      locale: locale as Locale,
      canonical: '/simulateur/bilan',
    }),
  }
}

export default function Layout({
  children,
}: LayoutProps<'/[locale]/simulateur/bilan'>) {
  return <SimulateurLayout>{children}</SimulateurLayout>
}
