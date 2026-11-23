import { formatFootprint } from '@/helpers/formatters/formatFootprint'
import { getLocale } from '@/helpers/getLocale'
import { getServerTranslation } from '@/helpers/getServerTranslation'
import type { Locale } from '@/i18nConfig'
import { cn } from 'cn'
import { Target, TrendingDown } from 'lucide-react'
import type { CSSProperties, ReactNode } from 'react'
import Trans from '../../translation/trans/TransServer'
import ClickProxy from '../ClickProxy'
import FootprintInfoPopover from '../FootprintInfoPopover'
import { THIRD_OBJECTIVE } from '../objective/_constants/objectives'
import {
  AVERAGE_FOOTPRINT_KG,
  getComparisonBarPercents,
  getFootprintComparison,
  type FootprintComparisonLevel,
} from './footprintComparison'

interface Props {
  value: number
  variant: 'inline' | 'aside'
  className?: string
  /** Id of the footnote explaining the “*” on the average */
  describedById?: string
}

interface Bar {
  key: string
  name: ReactNode
  nameClassName: string
  /** Popover explaining the bar, next to its name */
  info?: ReactNode
  opensInfoId?: string
  percent: number
  /** Where the value sits along the bar, when it differs from its length */
  valuePercent?: number
  value: string
  valueClassName: string
  barClassName: string
  delayMs: number
}

const levelClassNames: Record<
  FootprintComparisonLevel,
  { bar: string; text: string; bracket: string }
> = {
  above: {
    bar: 'bg-secondary-400',
    text: 'text-secondary-800',
    bracket: 'border-secondary-400',
  },
  close: {
    bar: 'bg-divers-400',
    text: 'text-divers-800',
    bracket: 'border-divers-500',
  },
  below: {
    bar: 'bg-logement-400',
    text: 'text-logement-800',
    bracket: 'border-logement-500',
  },
}

// Bars grow once the card has faded in, then the values fade in
const barGrowClassName = '[animation-fill-mode:both] motion-reduce:animate-none'
const revealClassName =
  'animate-fade-in [animation-delay:1400ms] [animation-duration:400ms] [animation-fill-mode:both] motion-reduce:animate-none'

// Height of a value label, in percent of the vertical chart
const VALUE_LABEL_HEIGHT_PERCENT = 18

function targetStyle(percent: number, delayMs: number) {
  return {
    '--target-value': `${percent}%`,
    animationDelay: `${delayMs}ms`,
  } as CSSProperties
}

export default async function FootprintComparisonChart({
  value,
  variant,
  className,
  describedById,
}: Props) {
  const locale = await getLocale()
  const { t } = await getServerTranslation()

  const { level, deltaKg } = getFootprintComparison(value)
  const percents = getComparisonBarPercents(value)
  const colors = levelClassNames[level]

  const deltaLabel = `${deltaKg > 0 ? '+' : '\u2212'}${formatTons(Math.abs(deltaKg), locale, t)}`

  const ariaLabel = t(
    'results.footprintBlock.carbone.chart.label',
    'Votre empreinte : {{footprint}}. Moyenne de nos utilisateurs : {{average}}. Objectif 2050 : {{objective}}.',
    {
      footprint: formatTons(value, locale, t, false),
      average: formatTons(AVERAGE_FOOTPRINT_KG, locale, t, false),
      objective: formatTons(THIRD_OBJECTIVE.value, locale, t, false),
    }
  )

  const isAside = variant === 'aside'
  const objectiveInfoButtonId = `footprint-chart-${variant}-objective-info`

  const objectiveInfoTitle = t(
    'results.footprintBlock.carbone.objective.info.title',
    'Pourquoi viser 2 tonnes ?'
  )

  // Just under the average, the footprint value would sit on the dashed line:
  // it goes above it instead, level with the average value
  const isFootprintValueOnAverageLine =
    percents.footprint < percents.average &&
    percents.average - percents.footprint < VALUE_LABEL_HEIGHT_PERCENT

  const bars: Bar[] = [
    {
      key: 'footprint',
      name: (
        <Trans i18nKey="results.footprintBlock.carbone.chart.you">Vous</Trans>
      ),
      nameClassName: 'font-bold',
      percent: percents.footprint,
      valuePercent: isFootprintValueOnAverageLine
        ? percents.average
        : undefined,
      value: formatTons(value, locale, t),
      valueClassName: colors.text,
      barClassName: colors.bar,
      delayMs: 500,
    },
    {
      key: 'average',
      name: (
        <Trans i18nKey="results.footprintBlock.carbone.chart.average">
          Moyenne de nos utilisateurs*
        </Trans>
      ),
      nameClassName: 'text-slate-600',
      percent: percents.average,
      value: formatTons(AVERAGE_FOOTPRINT_KG, locale, t),
      valueClassName: 'text-primary-800',
      barClassName: 'bg-primary-200',
      delayMs: 650,
    },
    {
      key: 'objective',
      name: (
        <Trans i18nKey="results.footprintBlock.carbone.chart.objective">
          Objectif 2050
        </Trans>
      ),
      nameClassName: 'text-slate-600',
      info: (
        <FootprintInfoPopover
          className="ml-0.5 inline-flex size-5 align-middle [&_svg]:size-4.5"
          triggerId={objectiveInfoButtonId}
          label={objectiveInfoTitle}
          title={objectiveInfoTitle}
          icon={<Target aria-hidden="true" className="size-5" />}
          side={isAside ? 'left' : undefined}
          alignOffset={isAside ? -16 : undefined}
          withArrow={isAside}>
          <p className="mb-0">
            <Trans i18nKey="results.footprintBlock.carbone.objective.info.everyone">
              Réduire les émissions de gaz à effet de serre, c’est l’affaire de
              tous ! Citoyens, associations, collectivités, entreprises,
              pouvoirs publics… nous avons tous un rôle à jouer.
            </Trans>
          </p>

          <p className="mb-0">
            <Trans i18nKey="results.footprintBlock.carbone.objective.info.neutrality">
              Pour limiter le changement climatique sous 2 °C, il faut rétablir
              un équilibre entre la quantité de gaz émis et la capacité de la
              planète à les absorber. C’est ce qu’on appelle la{' '}
              <strong className="text-default">neutralité carbone</strong>.
              L’objectif est d’atteindre cet équilibre en 2050.
            </Trans>
          </p>

          <p className="mb-0">
            <Trans i18nKey="results.footprintBlock.carbone.objective.info.target">
              Atteindre la neutralité carbone, c’est possible si nous émettons{' '}
              <strong className="text-default">
                moins de 2 tonnes de CO₂e par personne et par an
              </strong>
              .
            </Trans>
          </p>

          <div className="bg-secondary-50 text-secondary-900 flex gap-3 rounded-xl p-3 text-sm">
            <TrendingDown
              aria-hidden="true"
              className="text-secondary-700 mt-0.5 size-5 shrink-0"
            />

            <p className="mb-0">
              <Trans i18nKey="results.footprintBlock.carbone.objective.info.challenge">
                C’est environ 4 fois moins que la moyenne française actuelle :
                un vrai défi, mais atteignable en combinant efforts personnels
                et transformations de la société.
              </Trans>
            </p>
          </div>
        </FootprintInfoPopover>
      ),
      opensInfoId: objectiveInfoButtonId,
      percent: percents.objective,
      value: formatTons(THIRD_OBJECTIVE.value, locale, t),
      valueClassName: 'text-primary-800',
      // A target rather than emissions: outlined, not filled
      barClassName:
        'border-primary-400 bg-primary-50 hover:border-primary-700 hover:bg-primary-100 cursor-pointer border-2 border-dashed transition-colors',
      delayMs: 800,
    },
  ]

  const lowPercent = Math.min(percents.footprint, percents.average)
  const highPercent = Math.max(percents.footprint, percents.average)

  return (
    <div
      role="group"
      aria-label={ariaLabel}
      aria-describedby={describedById}
      className={cn(
        'w-full text-xs md:mx-auto md:w-65 lg:w-98 lg:text-sm',
        className
      )}>
      {/* The top margin leaves room for the value above the tallest bar */}
      <div aria-hidden="true" className="relative mt-6 h-24 lg:mt-9 lg:h-52">
        <div
          className={cn(
            'border-primary-300 absolute right-0 left-16 hidden border-t-2 border-dashed lg:block',
            revealClassName
          )}
          style={{ bottom: `${percents.average}%` }}
        />

        {deltaKg !== 0 && (
          <>
            <div
              className={cn(
                'absolute left-17 hidden w-2 rounded-l-md border-2 border-r-0 lg:block',
                colors.bracket,
                revealClassName
              )}
              style={{
                bottom: `${lowPercent}%`,
                height: `${highPercent - lowPercent}%`,
              }}
            />
            <span
              className={cn(
                'absolute left-0 hidden w-16 translate-y-1/2 pr-1 text-right font-bold whitespace-nowrap tabular-nums lg:block',
                colors.text,
                revealClassName
              )}
              style={{ bottom: `${(lowPercent + highPercent) / 2}%` }}>
              {deltaLabel}
            </span>
          </>
        )}

        <div className="absolute inset-y-0 right-0 left-0 flex gap-4 md:gap-3 lg:left-20 lg:gap-6">
          {bars.map((bar) => {
            const barProps = {
              className: cn(
                'animate-bar-grow-vertical h-0 w-full rounded-t-md rounded-b-xs motion-reduce:h-(--target-value) md:mx-auto md:w-14 lg:w-full lg:rounded-t-xl lg:rounded-b-sm',
                barGrowClassName,
                bar.barClassName
              ),
              style: targetStyle(bar.percent, bar.delayMs),
            }

            return (
              <div
                key={bar.key}
                className="relative flex flex-1 items-end lg:max-w-22">
                {bar.opensInfoId ? (
                  <ClickProxy targetId={bar.opensInfoId} {...barProps} />
                ) : (
                  <div {...barProps} />
                )}
                <span
                  className={cn(
                    'absolute inset-x-0 mb-0.75 text-center text-[0.9rem] font-bold whitespace-nowrap tabular-nums lg:mb-1.5 lg:text-lg',
                    bar.valueClassName,
                    revealClassName
                  )}
                  style={{ bottom: `${bar.valuePercent ?? bar.percent}%` }}>
                  {bar.value}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      <div className="mt-1.5 flex gap-4 leading-tight md:gap-3 lg:mt-2 lg:ml-20 lg:gap-6">
        {bars.map((bar) => (
          <span
            key={bar.key}
            className={cn(
              'flex-1 text-center text-balance lg:max-w-22',
              bar.nameClassName
            )}>
            <span aria-hidden="true">{bar.name}</span>
            {bar.info}
          </span>
        ))}
      </div>
    </div>
  )
}

// Abbreviated units keep the labels as narrow as the bars, the accessible
// label spells them out
function formatTons(
  kg: number,
  locale: Locale,
  t: (key: string) => string,
  shouldUseAbbreviation = true
) {
  const { formattedValue, unit } = formatFootprint(kg, {
    locale,
    t,
    metric: 'carbone',
    unit: 't',
    shouldUseAbbreviation,
  })
  return `${formattedValue} ${unit}`
}
