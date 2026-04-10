import ExternalLinkIcon from '@/components/icons/ExternalLinkIcon'
import Link from '@/components/Link'
import Trans from '@/components/translation/trans/TransServer'
import Title from '@/design-system/layout/Title'
import { getServerTranslation } from '@/helpers/getServerTranslation'
import type { Locale } from '@/i18nConfig'
import Image from 'next/image'

interface Props {
  locale: Locale
}

export default async function WaterActions({ locale }: Props) {
  const { t } = await getServerTranslation({ locale })

  return (
    <div className="mb-12">
      <Title hasSeparator={false} tag="h2" size="lg">
        <Trans locale={locale} i18nKey="endPage.waterActions.title">
          Comment agir ?
        </Trans>
      </Title>

      <p>
        <Trans locale={locale} i18nKey="endPage.waterActions.description1">
          <strong>
            La majeure partie de l'empreinte eau concerne la pousse des
            végétaux,
          </strong>{' '}
          que ce soit pour nous alimenter, pour nourrir le bétail, ou pour
          obtenir la matière première de nombre de nos vêtements.
        </Trans>
      </p>

      <p className="mb-6">
        <Trans locale={locale} i18nKey="endPage.waterActions.description2">
          Retrouvez nos conseils dans ces articles :
        </Trans>
      </p>

      <ul className="mb-4 flex justify-center gap-4">
        <li>
          <Link
            href={'/blog/consommation/reflexes-textile-econome-empreinte-eau'}
            aria-label={t(
              'endPage.waterActions.lireArticle',
              "Les 4 réflexes à adopter pour une garde-robe économe en eau, ouvrir l'article dans une nouvelle fenêtre"
            )}
            target="_blank"
            className="border-primary-50 hover:bg-primary-100 relative flex flex-1 flex-col justify-between overflow-hidden rounded-xl border-2 bg-gray-100 pb-4 no-underline lg:p-4">
            <div>
              <Image
                src="https://nosgestesclimat-prod.s3.fr-par.scw.cloud/cms/medium_priscilla_du_preez_9d7a6e02a2.jpg"
                width="400"
                height="200"
                className="mx-auto mb-3 h-24 w-full object-cover lg:h-36"
                alt=""
              />
              <p className="mb-3 px-4 text-center text-sm leading-tight text-black lg:px-0 lg:text-base">
                <Trans
                  locale={locale}
                  i18nKey="endPage.waterActions.article1Title">
                  Les 4 réflexes à adopter pour une garde-robe économe en eau
                </Trans>
              </p>
            </div>
            <div className="text-primary-700 text-center text-sm underline">
              <Trans locale={locale} i18nKey="endPage.waterActions.readArticle">
                Lire l'article
              </Trans>{' '}
              <ExternalLinkIcon className="stroke-primary-700 ml-2" />
            </div>
          </Link>
        </li>

        <li>
          <Link
            href={
              '/blog/alimentation/8-facons-ameliorer-empreinte-de-mon-assiette'
            }
            aria-label={t(
              'endPage.waterActions.lireArticle',
              "Les 9 manières d'améliorer l'empreinte eau de mon assiette, ouvrir l'article dans une nouvelle fenêtre"
            )}
            target="_blank"
            className="border-primary-50 hover:bg-primary-100 relative flex flex-1 flex-col justify-between overflow-hidden rounded-xl border-2 bg-gray-100 pb-4 no-underline lg:p-4">
            <div>
              <Image
                src="https://s3.fr-par.scw.cloud/nosgestesclimat-prod/cms/medium_lumin_osity_arrosage_champ_eeafa85606.jpg"
                width="400"
                height="200"
                className="mx-auto mb-3 h-24 w-full object-cover lg:h-36"
                alt=""
              />
              <p className="mb-3 px-4 text-center text-sm leading-tight text-black lg:px-0 lg:text-base">
                <Trans
                  locale={locale}
                  i18nKey="endPage.waterActions.article2Title">
                  Les 9 manières d'améliorer l'empreinte eau de mon assiette
                </Trans>
              </p>
            </div>
            <div className="text-primary-700 text-center text-sm underline">
              <Trans locale={locale} i18nKey="endPage.waterActions.readArticle">
                Lire l'article
              </Trans>{' '}
              <ExternalLinkIcon className="stroke-primary-700 ml-2" />
            </div>
          </Link>
        </li>
      </ul>
    </div>
  )
}
