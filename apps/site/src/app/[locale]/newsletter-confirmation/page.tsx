import Footer from '@/components/layout/Footer'
import Main from '@/design-system/layout/Main'
import { t } from '@/helpers/metadata/fakeMetadataT'
import { getCommonMetadata } from '@/helpers/metadata/getCommonMetadata'
import type { DefaultPageProps } from '@/types'
import { notFound } from 'next/navigation'
import NewsletterErrorMessage from './_components/NewsletterErrorMessage'
import NewsletterInvalidMessage from './_components/NewsletterInvalidMessage'
import NewsletterSuccessMessage from './_components/NewsletterSuccessMessage'

interface SearchParams {
  success: 'true' | 'false'
  status?: '404' | '500'
}

export const generateMetadata = getCommonMetadata({
  title: t("Confirmation d'inscription à nos infolettres - Nos Gestes Climat"),
  image:
    'https://nosgestesclimat-prod.s3.fr-par.scw.cloud/cms/calculer_empreinte_carbone_et_eau_ecccc9a625.png',
  description: t(
    "2 millions de personnes ont déjà calculé leur empreinte sur le climat avec le calculateur Nos Gestes Climat ! Et vous, qu'attendez-vous pour faire le test ?"
  ),
  alternates: {
    canonical: '',
  },
})

const shouldRedirect404 = ({ success, status }: Partial<SearchParams>) => {
  if (!success) return true

  if (success !== 'true' && success !== 'false') return true

  if (success === 'false' && status !== '404' && status !== '500') return true

  return false
}

export default async function NewsletterConfirmationPage({
  params,
  searchParams,
}: DefaultPageProps<{ searchParams: SearchParams }>) {
  const { locale } = await params
  const { success, status } = searchParams ? await searchParams : {}

  if (shouldRedirect404({ success, status })) {
    notFound()
  }

  return (
    <>
      <Main>
        <div className="min-h-screen">
          <div className="mt-36 text-center">
            {success === 'true' && <NewsletterSuccessMessage locale={locale} />}

            {success === 'false' && status === '404' && (
              <NewsletterInvalidMessage locale={locale} />
            )}

            {success === 'false' && status === '500' && (
              <NewsletterErrorMessage locale={locale} />
            )}
          </div>
        </div>
      </Main>

      <Footer locale={locale} />
    </>
  )
}
