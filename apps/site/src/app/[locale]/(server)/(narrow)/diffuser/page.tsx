import MDXContent from '@/components/mdx/MDXContent'
import { t } from '@/helpers/metadata/fakeMetadataT'
import { getCommonMetadata } from '@/helpers/metadata/getCommonMetadata'
import DiffuserEn from '@/locales/pages/en/diffuser.mdx'
import DiffuserFr from '@/locales/pages/fr/diffuser.mdx'
import type { DefaultPageProps } from '@/types'

export const generateMetadata = getCommonMetadata({
  title: t("Diffuser notre calculateur d'empreinte climat - Nos Gestes Climat"),
  description: t('Diffusez Nos Gestes Climat dans votre organisation.'),
  alternates: {
    canonical: '/diffuser',
  },
})

export default async function DiffuserPage({ params }: DefaultPageProps) {
  const { locale } = await params

  return (
    <MDXContent locale={locale} contentEn={DiffuserEn} contentFr={DiffuserFr} />
  )
}
