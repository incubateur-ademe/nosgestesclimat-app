import type { PartnerType } from '@/adapters/cmsClient'
import DefaultErrorAlert from '@/components/error/DefaultErrorAlert'
import CategoryTabs from '@/components/filtering/CategoryTabs'
import Trans from '@/components/translation/trans/TransServer'
import { FILTER_SEARCH_PARAM_KEY } from '@/constants/filtering'
import InlineLink from '@/design-system/inputs/InlineLink'
import Title from '@/design-system/layout/Title'
import Emoji from '@/design-system/utils/Emoji'
import { getServerTranslation } from '@/helpers/getServerTranslation'
import { t } from '@/helpers/metadata/fakeMetadataT'
import { getCommonMetadata } from '@/helpers/metadata/getCommonMetadata'
import { fetchPartners } from '@/services/cms/fetchPartners'
import type { DefaultPageProps } from '@/types'
import type { DottedName } from '@incubateur-ademe/nosgestesclimat'
import Image from 'next/image'
import PartnersDisplay from './_components/PartnersDisplay'

export const generateMetadata = getCommonMetadata({
  title: t('Nos relais - Nos Gestes Climat'),
  description: t(
    'Découvrez les relais de Nos Gestes Climat : organisations, collectivités, médias, influenceurs, etc.'
  ),
  alternates: {
    canonical: '/nos-relais',
  },
})

const getPartnersByCategory = (partners: PartnerType[]) => {
  return partners.reduce(
    (acc, partner) => {
      if (!Object.keys(acc).includes(partner.category.category)) {
        acc[partner.category.category] = []
      }

      acc[partner.category.category].push(partner)

      return acc
    },
    {} as Record<string, PartnerType[]>
  )
}

export default async function OurPartners({
  params,
  searchParams,
}: DefaultPageProps & {
  searchParams: Promise<{ [FILTER_SEARCH_PARAM_KEY]?: string }>
}) {
  const { locale } = await params
  const { [FILTER_SEARCH_PARAM_KEY]: categoryFilter } = await searchParams

  const { t } = await getServerTranslation({ locale })

  const { data: partners, isError } = await fetchPartners()

  const partnersByCategories = getPartnersByCategory(partners)

  return (
    <div>
      <Title>
        <Trans i18nKey="nos-relais.title" locale={locale}>
          Ils relaient{' '}
          <span className="text-primary-700">Nos Gestes Climat</span>
        </Trans>
      </Title>

      <div className="mb-8 flex flex-col items-center md:flex-row md:flex-nowrap md:gap-16">
        <div className="flex-1">
          <p>
            <strong className="text-primary-700">
              <Trans locale={locale}>Plusieurs milliers d’organisations</Trans>
            </strong>{' '}
            <Trans locale={locale}>
              partagent Nos Gestes Climat via leur site ou des campagnes (mails,
              réseaux sociaux, affichage), nous permettant de sensibiliser près
              de 2 000 personnes chaque jour. Un grand merci à eux !
            </Trans>
          </p>

          <p>
            <Trans locale={locale}>
              Vous relayez Nos Gestes Climat et souhaitez apparaître dans notre
              galerie ?
            </Trans>{' '}
            <InlineLink className="inline" href="/contact">
              <Trans locale={locale}>
                Envoyez-nous votre logo via notre page de contact
              </Trans>
            </InlineLink>
          </p>

          <p className="mb-8 italic">
            <Emoji>ℹ️</Emoji> <Trans locale={locale}>N.B.</Trans>{' '}
            <Trans locale={locale}>
              : aucun acteur cité ci-dessous ne finance Nos Gestes Climat, qui
              est et restera un service public, indépendant et gratuit de
              l'ADEME.
            </Trans>
          </p>
        </div>

        <Image
          width="200"
          height="400"
          className="ml-auto w-64 self-start md:-mt-16"
          alt={t(
            'Un grand-père et sa petite-fille au cinéma, mangeant du pop-corn.'
          )}
          src="https://nosgestesclimat-prod.s3.fr-par.scw.cloud/cms/at_the_cinema_b2d25b4202.svg"
        />
      </div>

      {isError && <DefaultErrorAlert />}

      {partnersByCategories && (
        <>
          <CategoryTabs
            categories={Object.keys(partnersByCategories).map(
              (category: string) => ({
                title: category,
                dottedName: category as DottedName,
                count: partnersByCategories[category].length,
              })
            )}
            className="mb-6">
            <PartnersDisplay
              partnersByCategories={partnersByCategories}
              categoryFilter={categoryFilter}
            />
          </CategoryTabs>
        </>
      )}
    </div>
  )
}
