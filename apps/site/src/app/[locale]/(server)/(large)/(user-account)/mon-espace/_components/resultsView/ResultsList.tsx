import Trans from '@/components/translation/trans/TransServer'
import { formatFootprint } from '@/helpers/formatters/formatFootprint'
import { getServerTranslation } from '@/helpers/getServerTranslation'
import type { Locale } from '@/i18nConfig'
import type { Simulation } from '@/publicodes-state/types'
import SeeListItemDetailLink from './resultsList/SeeListItemDetailLink'

interface Props {
  locale: Locale
  simulations: Simulation[]
  hasMigratedSimulations: boolean
}

export default async function ResultsList({
  locale,
  simulations,
  hasMigratedSimulations,
}: Props) {
  const { t } = await getServerTranslation({ locale })

  return (
    <div className="mb-8 md:mb-10">
      <h2 className="mb-6 text-2xl md:mb-8">
        <Trans locale={locale} i18nKey="mon-espace.resultsList.title">
          Tous mes résultats
        </Trans>
      </h2>

      {hasMigratedSimulations && (
        <p>
          <Trans
            locale={locale}
            i18nKey="mon-espace.resultsList.hasMigratedSimulations">
            Nous avons retrouvé des simulations sur ce navigateur et les avons
            ajoutées à votre espace. Vous pouvez les supprimer à tout moment.
          </Trans>
        </p>
      )}

      <ul className="flex flex-col gap-2">
        {simulations
          .sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
          )
          .map((simulation) => {
            const { formattedValue, unit } = formatFootprint(
              simulation.computedResults.carbone.bilan,
              { t }
            )
            return (
              <li key={simulation.id}>
                <article className="flex flex-col items-baseline gap-2 rounded-lg border border-slate-200 px-6 py-4 md:flex-row">
                  <div className="flex flex-col items-baseline gap-1 sm:flex-row md:w-[420px]">
                    <h1 className="mb-0 text-base md:text-lg">
                      {t(
                        'mon-espace.resultsList.result.title',
                        'Le {{date}} :',
                        {
                          date: new Date(simulation.date).toLocaleDateString(
                            locale,
                            {
                              day: '2-digit',
                              month: 'long',
                              year: 'numeric',
                            }
                          ),
                        }
                      )}
                    </h1>

                    <span className="mr-6 inline-block text-base font-bold md:text-lg">
                      {formattedValue} {unit}{' '}
                      <Trans
                        locale={locale}
                        i18nKey="mon-espace.resultsList.result.unit">
                        CO₂e / an
                      </Trans>
                    </span>
                  </div>

                  <SeeListItemDetailLink simulationId={simulation.id} />
                </article>
              </li>
            )
          })}
      </ul>
    </div>
  )
}
