import Footer from '@/components/layout/Footer'
import { noIndexObject } from '@/constants/metadata'
import { t } from '@/helpers/metadata/fakeMetadataT'
import { getCommonMetadata } from '@/helpers/metadata/getCommonMetadata'
import { getUserSession } from '@/services/auth/get-user-session'
import type { DefaultPageProps } from '@/types'
import { ClientLayout } from '../../../components/layout/ClientLayout'

export const generateMetadata = getCommonMetadata({
  title: t(
    'Nos Gestes Climat, calculez votre empreinte climatique, mode intégré'
  ),
  description: t(
    "2 millions de personnes ont déjà calculé leur empreinte sur le climat avec le calculateur Nos Gestes Climat ! Et vous, qu'attendez-vous pour faire le test ?"
  ),
  alternates: {
    canonical: '/accueil-iframe',
  },
  robots: noIndexObject,
  image: '/_static/cms/calculer_empreinte_carbone_et_eau_ecccc9a625.png',
})

export default async function Homepage({ params }: DefaultPageProps) {
  const { locale } = await params
  const userSession = await getUserSession()

  return (
    <ClientLayout locale={locale} userSession={userSession}>
      <iframe
        title="ngc"
        src="https://nosgestesclimat-site-preprod-pr2120.osc-fr1.scalingo.io/en/?iframe=true&shareData=true&onlySimulation=true&integratorUrl=https://energic.io&bypass_key=3eb78d2ca4ebd94378f80bc78a8f31f3197dcc7ba5d69eebec8f6e2096beaffe"
      />

      <Footer locale={locale} />
    </ClientLayout>
  )
}
