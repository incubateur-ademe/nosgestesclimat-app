import { END_PAGE_ACTIONS_PATH } from '@/constants/urls/paths'
import ButtonLink from '@/design-system/buttons/ButtonLink'
import Card from '@/design-system/layout/Card'
import { formatFootprint } from '@/helpers/formatters/formatFootprint'
import { getServerTranslation } from '@/helpers/getServerTranslation'
import type { Locale } from '@/i18nConfig'
import type { Tendency } from '@nosgestesclimat/core/features/simulations/services/get-simulation-result.service'
import { twMerge } from 'cn'
import { ThermometerSun } from 'lucide-react'
import Trans from '../../translation/trans/TransServer'
import FootprintInfoPopover from '../FootprintInfoPopover'
import TendencyIndicator from '../TendencyIndicator'
import FootprintComparisonChart from './FootprintComparisonChart'
import {
  getFootprintComparison,
  type FootprintComparisonLevel,
} from './footprintComparison'

interface Props {
  locale: Locale
  value: number
  tendency?: Tendency
  className?: string
}

const pillClassNames: Record<FootprintComparisonLevel, string> = {
  above: 'bg-secondary-100 text-secondary-800',
  close: 'bg-divers-100 text-divers-800',
  below: 'bg-logement-100 text-logement-800',
}

export default function CarbonFootprintHero({
  locale,
  value,
  tendency,
  className,
}: Props) {
  const { t } = getServerTranslation({ locale })

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
      'Égal à la moyenne*'
    )
  } else if (deltaKg > 0) {
    comparisonLabel = t(
      'results.footprintBlock.carbone.comparison.more',
      '{{delta}} {{unit}} de plus que la moyenne*',
      deltaValues
    )
  } else {
    comparisonLabel = t(
      'results.footprintBlock.carbone.comparison.less',
      '{{delta}} {{unit}} de moins que la moyenne*',
      deltaValues
    )
  }

  return (
    <Card
      className={twMerge(
        'animate-fade-in-slide-from-top to-primary-100/80 via-primary-50 border-primary-100 grid items-center gap-6 overflow-hidden rounded-[20px] bg-linear-to-br from-white p-6 shadow-xs [animation-delay:200ms] [animation-fill-mode:both] motion-reduce:translate-y-0 motion-reduce:animate-none motion-reduce:opacity-100 md:px-11 md:py-7 lg:grid-cols-2 lg:gap-10',
        className
      )}>
      <div className="flex w-full flex-col items-start">
        <h1 className="-mb-2 text-lg leading-tight font-bold">
          <Trans locale={locale} i18nKey="results.footprintBlock.carbone.title">
            Votre empreinte carbone
          </Trans>
        </h1>

        <div className="flex flex-wrap items-baseline gap-x-3.5 gap-y-1">
          <p className="text-primary-700 mb-0 text-[clamp(3.6rem,6vw,4.5rem)] leading-[0.9] font-extrabold tracking-tight tabular-nums">
            {formattedValue}
          </p>

          <div className="flex items-start gap-1.5 whitespace-nowrap">
            <p className="text-primary-700 mb-0 text-[1.1rem]">
              {unit}&nbsp;
              <Trans
                locale={locale}
                i18nKey="results.footprintBlock.carbone.unitSuffix">
                de CO₂e&nbsp;/&nbsp;an
              </Trans>
            </p>

            <FootprintInfoPopover
              className="md:relative md:-top-6"
              label={infoTitle}
              title={infoTitle}>
              <p className="mb-0">
                <Trans
                  locale={locale}
                  i18nKey="results.footprintBlock.carbone.info.definition">
                  Le CO₂e (équivalent CO₂) regroupe tous les gaz à effet de
                  serre que vous émettez, notamment via vos déplacements, votre
                  alimentation, votre logement et votre consommation.
                </Trans>
              </p>

              <div className="bg-secondary-50 text-secondary-900 flex gap-3 rounded-xl p-3 text-sm">
                <ThermometerSun
                  aria-hidden="true"
                  className="text-secondary-700 mt-0.5 size-5 shrink-0"
                />

                <p className="mb-0">
                  <Trans
                    locale={locale}
                    i18nKey="results.footprintBlock.carbone.info.impact">
                    Ces gaz retiennent la chaleur dans l’atmosphère : plus ils
                    s’accumulent, plus le climat se dérègle, avec des canicules,
                    sécheresses et inondations plus fréquentes.
                  </Trans>
                </p>
              </div>
            </FootprintInfoPopover>
          </div>
        </div>

        <div className="mb-6 flex flex-wrap items-center gap-x-6 gap-y-3">
          <p
            aria-describedby="footprint-average-legend"
            className={twMerge(
              'mb-0 inline-flex items-center rounded-lg px-3 py-1.5 text-[0.9rem] font-bold tabular-nums',
              pillClassNames[level]
            )}>
            {comparisonLabel}
          </p>

          {tendency && (
            <TendencyIndicator locale={locale} tendency={tendency} />
          )}
        </div>

        <FootprintComparisonChart
          locale={locale}
          value={value}
          orientation="horizontal"
          className="mb-6 lg:hidden"
        />

        <p className="mb-6 max-w-[46ch] leading-normal text-slate-600">
          {level === 'above' && (
            <Trans
              locale={locale}
              i18nKey="results.footprintBlock.carbone.message.above">
              <strong className="text-default">
                Il est toujours temps de réduire votre impact !
              </strong>{' '}
              Explorez les actions que vous pourriez mettre en place à votre
              échelle pour faire baisser vos émissions.
            </Trans>
          )}
          {level === 'close' && (
            <Trans
              locale={locale}
              i18nKey="results.footprintBlock.carbone.message.close">
              <strong className="text-default">
                Votre empreinte ressemble à celle de millions de Français.
              </strong>{' '}
              Ensemble, nous pouvons faire baisser notre moyenne : trouvez votre
              première action, et embarquez vos proches.
            </Trans>
          )}
          {level === 'below' && (
            <Trans
              locale={locale}
              i18nKey="results.footprintBlock.carbone.message.below">
              <strong className="text-default">
                Bravo, vous montrez la voie !
              </strong>{' '}
              Votre empreinte tire notre moyenne vers le bas. Continuez sur
              votre lancée, et embarquez vos proches en leur montrant l'exemple
              !
            </Trans>
          )}
        </p>

        <ButtonLink href={END_PAGE_ACTIONS_PATH} color="primary" size="md">
          <Trans
            locale={locale}
            i18nKey="results.footprintBlock.actionsBlock.link">
            Découvrir mes actions
          </Trans>

          <span aria-hidden="true" className="ml-2">
            →
          </span>
        </ButtonLink>

        <p
          id="footprint-average-legend"
          className="mt-3 mb-0 text-sm text-slate-600">
          <Trans
            locale={locale}
            i18nKey="results.footprintBlock.carbone.legend">
            * Moyenne de nos utilisateurs (plus de 600 000 simulations par an).
          </Trans>
        </p>
      </div>

      <FootprintComparisonChart
        locale={locale}
        value={value}
        orientation="vertical"
        className="hidden lg:block"
      />
    </Card>
  )
}
