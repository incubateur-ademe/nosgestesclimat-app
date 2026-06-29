import Trans from '@/components/translation/trans/TransServer'
import Card from '@/design-system/layout/Card'
import Title from '@/design-system/layout/Title'
import Emoji from '@/design-system/utils/Emoji'
import { formatFootprint } from '@/helpers/formatters/formatFootprint'
import type { Simulation } from '@/helpers/server/model/simulations'
import dayjs from 'dayjs'
import ReuseButtons from './reuseSimulationForPoll/ReuseButtons'

interface ReuseSimulationForPollProps {
  reuseSimulation: () => void
  createNewSimulation: () => void
  locale: string
  disclaimer: React.ReactNode
  simulation: Simulation
}
export default function ReuseSimulationForPoll({
  reuseSimulation,
  createNewSimulation,
  locale,
  disclaimer,
  simulation,
  t,
}: ReuseSimulationForPollProps) {
  const { formattedValue, unit } = formatFootprint(
    simulation.computedResults.carbone.bilan,
    {
      locale,
      t,
    }
  )
  return (
    <Card className="mt-10 items-start rounded-2xl border-slate-100 p-8 shadow-md">
      <Title
        data-testid="commencer-title"
        className="text-lg font-bold md:text-xl"
        title={
          <span className="flex items-center">
            <Trans locale={locale} i18nKey="reuseSimulationForPoll.title">
              Vous avez déjà réalisé un calcul d’empreinte sur notre site
            </Trans>{' '}
            <Emoji className="ml-1">👏</Emoji>
          </span>
        }
      />

      <div className="border-primary-100 bg-primary-100 mb-8 w-lg max-w-full rounded-lg border px-5 py-4">
        <p className="mb-2 text-sm">
          <Trans locale={locale} i18nKey="reuseSimulationForPoll.testDate">
            Test réalisé le{' '}
            {dayjs(simulation.updated_at)
              .toDate()
              .toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-GB', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
              })}{' '}
            <Trans locale={locale} i18nKey="reuseSimulationForPoll.testDate.at">
              à
            </Trans>{' '}
            {dayjs(simulation.updated_at)
              .toDate()
              .toLocaleTimeString(locale === 'fr' ? 'fr-FR' : 'en-GB', {
                hour: '2-digit',
                minute: '2-digit',
              })}
          </Trans>
        </p>

        <p className="text-primary-800 mb-2 text-base">
          <Trans locale={locale} i18nKey="reuseSimulationForPoll.yourFootprint">
            Votre empreinte :
          </Trans>{' '}
          <span className="text-primary-800 mb-0! text-xl leading-8 font-bold">
            {formattedValue}&nbsp;{unit}&nbsp;
            <Trans locale={locale} i18nKey="common.co2eAn.title">
              CO₂e / an
            </Trans>
          </span>
        </p>

        {simulation.polls && simulation.polls.length > 0 && (
          <p className="mt-6 w-full text-sm">
            <span>
              <Emoji>📊</Emoji>{' '}
              <Trans
                locale={locale}
                i18nKey="reuseSimulationForPoll.attachedToPoll">
                Rattachée au test collectif :
              </Trans>
            </span>{' '}
            <span className="text-base font-medium">
              {simulation.polls.map((p) => p.name ?? p.slug).join(', ')}
            </span>
          </p>
        )}
      </div>

      <p className="mb-6">
        <Trans locale={locale} i18nKey="reuseSimulationForPoll.description">
          Vous pouvez utiliser vos données existantes, ou recommencer le test.
        </Trans>
      </p>

      <ReuseButtons
        reuseSimulation={reuseSimulation}
        createNewSimulation={createNewSimulation}
      />

      <div className="mt-8">{disclaimer}</div>
    </Card>
  )
}
