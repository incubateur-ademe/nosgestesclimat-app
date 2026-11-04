import Trans from '@/components/translation/trans/TransServer'
import { formatFootprint } from '@/helpers/formatters/formatFootprint'
import { getLocale } from '@/helpers/getLocale'
import { getServerTranslation } from '@/helpers/getServerTranslation'
import type { Simulation } from '@/helpers/server/model/simulations'

interface Props {
  simulation: Simulation
  buttons?: React.ReactNode
}

export async function ResultListItem({ simulation, buttons = null }: Props) {
  const locale = await getLocale()
  const { formattedValue, unit } = formatFootprint(
    simulation.computedResults.carbone.bilan,
    {
      localize: true,
      locale,
    }
  )
  const { t } = await getServerTranslation()

  return (
    <article className="flex w-full flex-col items-baseline gap-2 rounded-lg border border-slate-200 px-6 py-4 md:flex-row">
      <div className="flex flex-col items-baseline gap-1 sm:flex-row md:w-105 md:max-w-full">
        <h1 className="mb-0 text-base md:text-lg">
          {t('mon-espace.resultsList.result.title', 'Le {{date}} :', {
            date: new Date(simulation.date).toLocaleDateString(locale, {
              day: '2-digit',
              month: 'long',
              year: 'numeric',
            }),
          })}
        </h1>

        <span className="mr-6 inline-block text-base font-bold md:text-lg">
          {formattedValue} {unit}{' '}
          <Trans i18nKey="mon-espace.resultsList.result.unit">CO₂e / an</Trans>
        </span>
      </div>

      {buttons}
    </article>
  )
}
