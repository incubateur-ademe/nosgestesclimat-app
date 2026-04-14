import HeaderServer from '@/components/layout/HeaderServer'
import { PARTNER_KEY } from '@/constants/partners'
import Main from '@/design-system/layout/Main'
import { t } from '@/helpers/metadata/fakeMetadataT'
import { getCommonMetadata } from '@/helpers/metadata/getCommonMetadata'
import { verifyPartner } from '@/services/partners/verifyPartner'
import { notFound } from 'next/navigation'
import AdaptiveMessage from './_components/AdaptiveMessage'

export const generateMetadata = getCommonMetadata({
  title: t('Partagez vos résultats avec notre partenaire - Nos Gestes Climat'),
  description: t(
    "2 millions de personnes ont déjà calculé leur empreinte sur le climat avec le calculateur Nos Gestes Climat ! Et vous, qu'attendez-vous pour faire le test ?"
  ),
  alternates: {
    canonical: '',
  },
})

export default async function PartenairePage({
  searchParams,
  params,
}: PageProps<'/[locale]/partenaire'>) {
  const { locale } = await params
  const searchParamsObject = (await searchParams) ?? { partner: '' }

  const partner = (searchParamsObject[PARTNER_KEY] as string) ?? ''

  if (!partner) {
    notFound()
  }

  const partnerInfo = await verifyPartner(partner)

  if (!partnerInfo) {
    notFound()
  }

  return (
    <>
      <HeaderServer locale={locale} />

      <Main>
        <div className="min-h-screen">
          <div className="mt-36 text-center">
            <AdaptiveMessage partner={partner} />
          </div>
        </div>
      </Main>
    </>
  )
}
