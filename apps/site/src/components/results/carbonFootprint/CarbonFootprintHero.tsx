import { ACTIONS_SUGGESTED_PATH } from '@/constants/urls/paths'
import ButtonLink from '@/design-system/buttons/ButtonLink'
import { formatFootprint } from '@/helpers/formatters/formatFootprint'
import { getLocale } from '@/helpers/getLocale'
import { getServerTranslation } from '@/helpers/getServerTranslation'
import type { Tendency } from '@nosgestesclimat/core/features/simulations/services/get-simulation-result.service'
import { cn } from 'cn'
import { ThermometerSun } from 'lucide-react'
import { match } from 'ts-pattern'
import Trans from '../../translation/trans/TransServer'
import FootprintInfoPopover from '../FootprintInfoPopover'
import TendencyIndicator from '../TendencyIndicator'
import {
  getFootprintComparison,
  type FootprintComparisonLevel,
} from './footprintComparison'
import FootprintComparisonChart from './FootprintComparisonChart'

interface Props {
  value: number
  tendency?: Tendency
  className?: string
}

const pillClassNames: Record<FootprintComparisonLevel, string> = {
  above: 'bg-secondary-100 text-secondary-800',
  close: 'bg-divers-100 text-divers-800',
  below: 'bg-logement-100 text-logement-800',
}

export default async function CarbonFootprintHero({
  value,
  tendency,
  className,
}: Props) {
  const locale = await getLocale()
  const { t } = await getServerTranslation()

  const { formattedValue, unit } = formatFootprint(value, {
    locale,
    t,
    metric: 'carbone',
  })

  const { level, deltaKg } = getFootprintComparison(value)
  const infoTitle = t(
    'results.footprintBlock.carbone.info.label',
    'Qu’est-ce que l’empreinte carbone ?'
  )

  const delta = formatFootprint(Math.abs(deltaKg), {
    locale,
    t,
    metric: 'carbone',
    unit: 't',
  })
  const deltaValues = { delta: delta.formattedValue, unit: delta.unit }

  let comparisonLabel: string
  if (deltaKg === 0) {
    comparisonLabel = t(
      'results.footprintBlock.carbone.comparison.equal',
      'Égal à la moyenne'
    )
  } else if (deltaKg > 0) {
    comparisonLabel = t(
      'results.footprintBlock.carbone.comparison.more',
      '{{delta}} {{unit}} de plus que la moyenne',
      deltaValues
    )
  } else {
    comparisonLabel = t(
      'results.footprintBlock.carbone.comparison.less',
      '{{delta}} {{unit}} de moins que la moyenne',
      deltaValues
    )
  }

  return (
    <div
      className={cn(
        'animate-fade-in-slide-from-top grid items-center gap-6 bg-white py-1 [animation-delay:200ms] [animation-fill-mode:both] motion-reduce:translate-y-0 motion-reduce:animate-none motion-reduce:opacity-100 md:py-2 lg:grid-cols-2 lg:gap-9',
        className
      )}>
      <div className="flex w-full flex-col items-start gap-4 md:gap-6">
        <div className="flex flex-col items-start">
          <h1 className="mb-0 text-lg leading-tight font-bold">
            <Trans i18nKey="results.footprintBlock.carbone.title">
              Votre empreinte carbone
            </Trans>
          </h1>

          {/* The big figure's line box overflows its glyphs, mostly below the
            baseline: from `md`, the negative margins bring the title and the
            pill visually as close to it as they are to each other. On mobile,
            the figure gets more room around it. */}
          <div className="mt-1 mb-3 flex items-baseline-last gap-x-2.5 gap-y-1 md:-mt-2 md:-mb-2 md:flex-wrap md:gap-x-3.5">
            <p
              data-testid="carbon-footprint-value"
              className="text-primary-700 mb-0 text-[clamp(3.6rem,6vw,4.5rem)] leading-[0.9] font-extrabold tracking-tight tabular-nums">
              {formattedValue}
            </p>

            <div className="flex min-w-0 items-baseline-last gap-1.5 md:whitespace-nowrap">
              <p className="text-primary-700 mb-0 text-sm md:text-[1.1rem]">
                {unit}&nbsp;
                <Trans i18nKey="results.footprintBlock.carbone.unitSuffix">
                  de CO₂e&nbsp;/&nbsp;an
                </Trans>
              </p>

              <FootprintInfoPopover
                className="relative -top-4 md:-top-6"
                label={infoTitle}
                title={infoTitle}>
                <p className="mb-0">
                  <Trans i18nKey="results.footprintBlock.carbone.info.commonUnit">
                    Pour pouvoir comparer toutes les activités entre elles, les
                    scientifiques ont décidé d’utiliser une mesure commune pour
                    comptabiliser tous les gaz à effet de serre émis par les
                    activités humaines : cette unité de mesure est le{' '}
                    <strong className="text-default">
                      CO₂e (équivalent CO₂)
                    </strong>
                    .
                  </Trans>
                </p>

                <div className="bg-secondary-50 text-secondary-900 flex gap-3 rounded-xl p-3 text-sm">
                  <ThermometerSun
                    aria-hidden="true"
                    className="text-secondary-700 mt-0.5 size-5 shrink-0"
                  />

                  <p className="mb-0">
                    <Trans i18nKey="results.footprintBlock.carbone.info.impact">
                      Ces gaz retiennent la chaleur dans l’atmosphère : plus ils
                      s’accumulent, plus le climat se réchauffe, avec des
                      canicules, sécheresses et inondations plus fréquentes.
                    </Trans>
                  </p>
                </div>
              </FootprintInfoPopover>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <p
              className={cn(
                'mb-0 inline-flex items-center rounded-lg px-3 py-1.5 text-[0.9rem] font-bold tabular-nums',
                pillClassNames[level]
              )}>
              {comparisonLabel}
            </p>

            {tendency && <TendencyIndicator tendency={tendency} />}
          </div>
        </div>

        <FootprintComparisonChart
          value={value}
          idPrefix="footprint-chart-inline"
          className="lg:hidden"
        />

        <p className="mb-0 max-w-[46ch] leading-normal text-slate-600">
          {match(level)
            .with('above', () => (
              <Trans i18nKey="results.footprintBlock.carbone.message.above">
                <strong className="text-default">
                  Il est toujours temps de réduire votre impact !
                </strong>{' '}
                Explorez les actions que vous pourriez mettre en place à votre
                échelle pour faire baisser vos émissions.
              </Trans>
            ))
            .with('close', () => (
              <Trans i18nKey="results.footprintBlock.carbone.message.close">
                <strong className="text-default">
                  Votre empreinte carbone est proche de celle de millions
                  d’utilisateurs.
                </strong>{' '}
                Ensemble, nous pouvons encore limiter les émissions de gaz à
                effet de serre. Consultez nos propositions d’actions et
                embarquez vos proches.
              </Trans>
            ))
            .with('below', () => (
              <Trans i18nKey="results.footprintBlock.carbone.message.below">
                <strong className="text-default">
                  Bravo, vous montrez que c’est possible !
                </strong>{' '}
                Votre empreinte tire notre moyenne vers le bas. Continuez sur
                votre lancée, et embarquez vos proches !
              </Trans>
            ))
            .exhaustive()}
        </p>

        <ButtonLink
          href={ACTIONS_SUGGESTED_PATH}
          color="primary"
          size="md"
          className="mt-0.5 w-full md:mt-0 md:w-auto">
          <Trans i18nKey="results.footprintBlock.carbone.reduceLink">
            Réduire mes émissions
          </Trans>

          <span aria-hidden="true" className="ml-2">
            →
          </span>
        </ButtonLink>
      </div>

      <FootprintComparisonChart
        value={value}
        idPrefix="footprint-chart-aside"
        className="hidden lg:block"
      />
    </div>
  )
}
