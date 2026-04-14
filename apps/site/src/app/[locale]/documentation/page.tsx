import PasserTestBanner from '@/components/layout/PasserTestBanner'
import { t } from '@/helpers/metadata/fakeMetadataT'
import { getCommonMetadata } from '@/helpers/metadata/getCommonMetadata'
import DocumentationLanding from './_components/DocumentationLanding'

export const generateMetadata = getCommonMetadata({
  title: t(
    "Documentation de notre calculateur d'empreinte climatique - Nos Gestes Climat"
  ),
  description: t(
    'Notre documentation détaille les calculs qui nous ont permis de calculer votre bilan carbone personnel.'
  ),
  alternates: {
    canonical: '/documentation',
  },
})

export default function Documentation() {
  return (
    <div className="w-full max-w-4xl p-4 md:mx-auto md:py-8">
      <PasserTestBanner />

      <DocumentationLanding />
    </div>
  )
}
