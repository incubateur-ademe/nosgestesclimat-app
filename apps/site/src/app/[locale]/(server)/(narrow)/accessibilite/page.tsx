import MDXContent from '@/components/mdx/MDXContent'
import { t } from '@/helpers/metadata/fakeMetadataT'
import { getCommonMetadata } from '@/helpers/metadata/getCommonMetadata'
import accessibilityEn from '@/locales/pages/en/accessibility.mdx'
import accessibilityFr from '@/locales/pages/fr/accessibility.mdx'
import type { DefaultPageProps } from '@/types'

export const generateMetadata = getCommonMetadata({
  title: t('Accessibilité - Nos Gestes Climat'),
  description: t(
    "Informations relatives à l'accessibilité de Nos Gestes Climat."
  ),
  alternates: {
    canonical: '/accessibilite',
  },
})

export default async function AccessibilityPage({ params }: DefaultPageProps) {
  const { locale } = await params
  return (
    <MDXContent
      contentEn={accessibilityEn}
      contentFr={accessibilityFr}
      locale={locale}
    />
  )
}
