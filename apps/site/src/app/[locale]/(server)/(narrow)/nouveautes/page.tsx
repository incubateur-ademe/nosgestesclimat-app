import SparklesIcon from '@/components/icons/SparklesIcon'
import List from '@/components/posts/List'
import Trans from '@/components/translation/trans/TransServer'
import InlineLink from '@/design-system/inputs/InlineLink'
import Title from '@/design-system/layout/Title'
import { getServerTranslation } from '@/helpers/getServerTranslation'
import { getPosts } from '@/helpers/markdown/getPosts'
import { t } from '@/helpers/metadata/fakeMetadataT'
import { getCommonMetadata } from '@/helpers/metadata/getCommonMetadata'
import type { DefaultPageProps } from '@/types'
import Image from 'next/image'

export const generateMetadata = getCommonMetadata({
  title: t('Les nouveautés du calculateur - Nos Gestes Climat'),
  description: t(
    'Consultez les nouvelles fonctionnalités et dernières nouvelles de Nos Gestes Climat.'
  ),
  alternates: {
    canonical: '/nouveautes',
  },
})

export default async function Releases({ params }: DefaultPageProps) {
  const { locale } = await params
  const releases = getPosts(`src/locales/nouveautes/${locale}/`)

  const { t } = await getServerTranslation({ locale })

  return (
    <>
      <div className="mt-4 flex flex-wrap gap-0 pb-8 md:flex-nowrap md:gap-16">
        <div>
          <Title
            data-testid="news-title"
            title={
              <span className="flex items-center">
                <Trans locale={locale}>Les nouveautés</Trans>
                <SparklesIcon className="fill-divers-300 ml-2" />
              </span>
            }
          />

          <p className="mb-0 max-w-74">
            <Trans locale={locale}>
              Nous améliorons le site en continu à partir de{' '}
              <InlineLink href="/contact">vos retours</InlineLink>. Découvrez la
              tambouille interne de Nos Gestes Climat.
            </Trans>
          </p>
        </div>

        <Image
          className="ml-auto w-32 md:-mt-4 md:w-48"
          src="https://nosgestesclimat-prod.s3.fr-par.scw.cloud/cms/medium_girl_cooking_fa71604f8d.png"
          width="200"
          height="400"
          alt={t('Une femme préparant un bon petit plat.')}
        />
      </div>

      <List locale={locale} items={releases} path="/nouveautes" />
    </>
  )
}
