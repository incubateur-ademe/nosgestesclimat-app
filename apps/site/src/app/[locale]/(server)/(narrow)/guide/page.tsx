import { t } from '@/helpers/metadata/fakeMetadataT'
import { getCommonMetadata } from '@/helpers/metadata/getCommonMetadata'
import { redirect } from 'next/navigation'

export const generateMetadata = getCommonMetadata({
  title: t('Le guide - Nos Gestes Climat'),
  description: t(
    'Retrouvez dans ce guide toutes les informations sur Nos Gestes Climat.'
  ),
  alternates: {
    canonical: '/guide',
  },
})

export default function GuidePage() {
  redirect('/')
}
