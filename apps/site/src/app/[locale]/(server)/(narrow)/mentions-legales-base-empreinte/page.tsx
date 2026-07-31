import MDXContent from '@/components/mdx/MDXContent'
import { t } from '@/helpers/metadata/fakeMetadataT'
import { getCommonMetadata } from '@/helpers/metadata/getCommonMetadata'
import { default as content } from './content.mdx'

export const generateMetadata = getCommonMetadata({
  title: t('Mentions légales Base Empreinte - Nos Gestes Climat'),
  description: t('Mentions légales de la Base Empreinte.'),
  alternates: {
    canonical: '/mentions-legales-base-empreinte',
    // French-only content
    languages: {
      fr: '/mentions-legales-base-empreinte',
    },
  },
})

export default function LegalMentionsBaseEmpreinte() {
  return <MDXContent locale="fr" contentFr={content} />
}
