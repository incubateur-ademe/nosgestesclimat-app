import MDXContent from '@/components/mdx/MDXContent'
import { t } from '@/helpers/metadata/fakeMetadataT'
import { getCommonMetadata } from '@/helpers/metadata/getCommonMetadata'
import ContentEn from '@/locales/pages/en/CGU.mdx'
import ContentFr from '@/locales/pages/fr/CGU.mdx'
import type { DefaultPageProps } from '@/types'

export const generateMetadata = getCommonMetadata({
  title: t('CGU - Nos Gestes Climat'),
  description: t("Conditions générales d'utilisation du site."),
  alternates: {
    canonical: '/cgu',
  },
})

export default async function CGUPage({ params }: DefaultPageProps) {
  const { locale } = await params

  return (
    <MDXContent contentEn={ContentEn} contentFr={ContentFr} locale={locale} />
  )
}
