import MDXContent from '@/components/mdx/MDXContent'
import { t } from '@/helpers/metadata/fakeMetadataT'
import { getCommonMetadata } from '@/helpers/metadata/getCommonMetadata'
import contentEnBottom from '@/locales/pages/en/budgetBottom.mdx'
import contentEnTop from '@/locales/pages/en/budgetTop.mdx'
import contentFrBottom from '@/locales/pages/fr/budgetBottom.mdx'
import contentFrTop from '@/locales/pages/fr/budgetTop.mdx'
import type { DefaultPageProps } from '@/types'
import SelectYear from './_components/SelectYear'

export const generateMetadata = getCommonMetadata({
  title: t('Budget - Nos Gestes Climat'),
  description: t('Informations relatives au budget de Nos Gestes Climat.'),
  alternates: {
    canonical: '/budget',
  },
})

export default async function BudgetPage({ params }: DefaultPageProps) {
  const { locale } = await params

  return (
    <>
      <MDXContent
        contentEn={contentEnTop}
        contentFr={contentFrTop}
        locale={locale}
      />
      <SelectYear />
      <MDXContent
        contentEn={contentEnBottom}
        contentFr={contentFrBottom}
        locale={locale}
      />
    </>
  )
}
