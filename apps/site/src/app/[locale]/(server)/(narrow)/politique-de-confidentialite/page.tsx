import MDXContent from '@/components/mdx/MDXContent'
import { t } from '@/helpers/metadata/fakeMetadataT'
import { getCommonMetadata } from '@/helpers/metadata/getCommonMetadata'
import type { DefaultPageProps } from '@/types'
import policy_en from './policy_en.mdx'
import policy_fr from './policy_fr.mdx'

export const generateMetadata = getCommonMetadata({
  title: t('Politique de confidentialité - Nos Gestes Climat'),
  description: t(
    'Découvrez comment nous utilisons vos données personnelles pour vous proposer un calculateur de bilan carbone personnel.'
  ),
  alternates: {
    canonical: '/politique-de-confidentialite',
  },
})

export default async function ViePriveePage({ params }: DefaultPageProps) {
  const { locale } = await params
  return (
    <div className="markdown">
      <MDXContent contentEn={policy_en} contentFr={policy_fr} locale={locale} />
    </div>
  )
}
