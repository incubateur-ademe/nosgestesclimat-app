import CheckIcon from '@/components/icons/status/CheckIcon'
import Trans from '@/components/translation/trans/TransServer'
import type { Locale } from '@/i18nConfig'

import QueryClientProviderWrapper from '@/app/[locale]/_components/mainLayoutProviders/QueryClientProviderWrapper'
import Ademe from '@/components/images/partners/Ademe'
import Marianne from '@/components/images/partners/Marianne'
import { MON_ESPACE_PATH } from '@/constants/urls/paths'
import ButtonLink from '@/design-system/buttons/ButtonLink'
import Title from '@/design-system/layout/Title'
import { getServerTranslation } from '@/helpers/getServerTranslation'
import { getUser } from '@/helpers/server/dal/user'
import Image from 'next/image'
import HideInIframe from '../layout/HideInIframe'
import SaveResultsForm from './SaveResultsForm'

interface Props {
  locale: Locale
  hasPreviousSimulation?: boolean
}

export default async function SaveResultsBlock({
  locale,
  hasPreviousSimulation,
}: Props) {
  const user = await getUser()

  const { t } = await getServerTranslation({ locale })

  return (
    <HideInIframe hideIfNotFrenchRegion>
      <Title tag="h2" hasSeparator={false} size="lg" className="mb-8">
        <Trans locale={locale} i18nKey="results.saveResults.title">
          Retrouvez facilement vos résultats{' '}
        </Trans>
      </Title>

      <section
        className="bg-primary-700 mb-12 rounded-2xl p-8"
        aria-labelledby="save-results-block-title">
        <div className="flex flex-col flex-wrap items-stretch gap-8 md:flex-row md:items-center lg:flex-nowrap">
          <div className="max-w-full flex-1">
            <Title
              tag="h3"
              size="md"
              hasSeparator={false}
              id="save-results-block-title"
              className="font-bold! text-white">
              {user.isAuth ? (
                <Trans
                  i18nKey="results.saveResults.title.authenticated"
                  locale={locale}>
                  Accédez à votre espace personnel
                </Trans>
              ) : (
                <Trans
                  i18nKey="results.saveResults.title.unauthenticated"
                  locale={locale}>
                  Recevez-les par e-mail et accédez à votre espace personnel
                </Trans>
              )}
            </Title>

            <ul role="list" className="mb-6 flex max-w-full flex-col gap-2">
              <li className="flex gap-2 text-white">
                <CheckIcon className="inline-block fill-white" />

                <span>
                  <Trans
                    i18nKey="results.saveResults.listItem1"
                    locale={locale}>
                    Retrouvez <strong>votre historique</strong>
                  </Trans>
                </span>
              </li>
              <li className="inline-flex gap-2 text-white">
                <CheckIcon className="inline-block fill-white" />

                <span>
                  <Trans
                    i18nKey="results.saveResults.listItem2"
                    locale={locale}>
                    Suivez <strong>votre évolution</strong>
                  </Trans>
                </span>
              </li>
              <li className="inline-flex gap-2 text-white">
                <CheckIcon className="inline-block fill-white" />

                <span>
                  <Trans
                    i18nKey="results.saveResults.listItem3"
                    locale={locale}>
                    Découvrez <strong>vos actions personnalisées</strong>
                  </Trans>
                </span>
              </li>
            </ul>

            {user.isAuth ? (
              <ButtonLink
                color="borderless"
                href={`${MON_ESPACE_PATH}${hasPreviousSimulation ? '#chart' : ''}`}>
                {hasPreviousSimulation ? (
                  <Trans
                    i18nKey="results.saveResults.buttonLabel.authenticated.withPreviousResults"
                    locale={locale}>
                    Voir l’évolution de mon résultat
                  </Trans>
                ) : (
                  <Trans
                    i18nKey="results.saveResults.buttonLabel.authenticated.noPreviousResults"
                    locale={locale}>
                    Accéder à mon espace
                  </Trans>
                )}
              </ButtonLink>
            ) : (
              <QueryClientProviderWrapper>
                <SaveResultsForm userId={user.id} />
              </QueryClientProviderWrapper>
            )}
          </div>
          <div className="max-w-full">
            {user.isAuth ? (
              <div className="flex w-full justify-center">
                <Image
                  src="https://nosgestesclimat-prod.s3.fr-par.scw.cloud/cms/visuel_login_cbf2f03684.svg"
                  alt={t(
                    'results.saveResults.imageAlt',
                    "Exemple de courbe de progression de mon empreinte, et de répartition de l'empreinte sur les catégories transport, logement, alimentation, divers et services."
                  )}
                  width="300"
                  height="300"
                />
              </div>
            ) : (
              <div className="flex justify-center gap-8 rounded-2xl bg-white p-6 md:p-10">
                <Marianne className="w-16 lg:h-auto" />

                <Ademe className="h-16 lg:h-auto" />
              </div>
            )}
          </div>
        </div>
      </section>
    </HideInIframe>
  )
}
