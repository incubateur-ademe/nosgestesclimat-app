import { formatFootprint } from '@/helpers/formatters/formatFootprint'
import { getServerTranslation } from '@/helpers/getServerTranslation'
import type { Locale } from '@/i18nConfig'
import { twMerge } from 'cn'
import type { CSSProperties, ReactNode } from 'react'
import Trans from '../../translation/trans/TransServer'
import { THIRD_OBJECTIVE } from '../objective/_constants/objectives'
import {
  AVERAGE_FOOTPRINT_KG,
  getComparisonBarPercents,
  getFootprintComparison,
  type FootprintComparisonLevel,
} from './footprintComparison'

interface Props {
  locale: Locale
  value: number
  /** Vertical bars next to the text on desktop, horizontal ones on mobile */
  orientation: 'vertical' | 'horizontal'
  className?: string
  /** Id of the footnote explaining the “*” on the average */
  describedById?: string
}

interface Bar {
  key: string
  name: ReactNode
  nameClassName: string
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

// On mobile, the longest bar leaves room for its value on its right
const HORIZONTAL_TRACK_RATIO = 0.75

function targetStyle(percent: number, delayMs: number) {
  return {
    '--target-value': `${percent}%`,
    animationDelay: `${delayMs}ms`,
  } as CSSProperties
}

export default function FootprintComparisonChart({
  locale,
  value,
  orientation,
  className,
  describedById,
}: Props) {
  const { t } = getServerTranslation({ locale })

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

  // Just under the average, the footprint value would sit on the dashed line:
  // it goes above it instead, level with the average value
  const isFootprintValueOnAverageLine =
    percents.footprint < percents.average &&
    percents.average - percents.footprint < VALUE_LABEL_HEIGHT_PERCENT

  const bars: Bar[] = [
    {
      key: 'footprint',
      name: (
        <Trans
          locale={locale}
          i18nKey="results.footprintBlock.carbone.chart.you">
          Vous
        </Trans>
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
        <Trans
          locale={locale}
          i18nKey="results.footprintBlock.carbone.chart.average">
          Moyenne*
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
        <Trans
          locale={locale}
          i18nKey="results.footprintBlock.carbone.chart.objective">
          Objectif 2050
        </Trans>
      ),
      nameClassName: 'text-slate-600',
      percent: percents.objective,
      value: formatTons(THIRD_OBJECTIVE.value, locale, t),
      valueClassName: 'text-primary-800',
      // A target rather than emissions: outlined, not filled
      barClassName: 'border-primary-400 bg-primary-50 border-2 border-dashed',
      delayMs: 800,
    },
  ]

  if (orientation === 'horizontal') {
    return (
      <div
        role="img"
        aria-label={ariaLabel}
        aria-describedby={describedById}
        className={twMerge(
          'grid w-full grid-cols-[auto_minmax(0,1fr)] items-center gap-x-3 gap-y-2 text-sm',
          className
        )}>
        {bars.map((bar, index) => (
          <div key={bar.key} className="contents">
            <span
              className={twMerge('col-start-1', bar.nameClassName)}
              style={{ gridRowStart: index + 1 }}>
              {bar.name}
            </span>

            <div
              className="col-start-2 flex h-7 items-center gap-2"
              style={{ gridRowStart: index + 1 }}>
              <div
                className={twMerge(
                  'animate-bar-grow-horizontal h-full w-0 rounded-l-sm rounded-r-lg motion-reduce:w-(--target-value)',
                  barGrowClassName,
                  bar.barClassName
                )}
                style={targetStyle(
                  bar.percent * HORIZONTAL_TRACK_RATIO,
                  bar.delayMs
                )}
              />
              <span
                className={twMerge(
                  'font-bold whitespace-nowrap tabular-nums',
                  bar.valueClassName,
                  revealClassName
                )}>
                {bar.value}
              </span>
            </div>
          </div>
        ))}

        {/* Spans all bars to mark the average level */}
        <div className="relative col-start-2 row-span-3 row-start-1 -my-1 self-stretch">
          <div
            className={twMerge(
              'border-primary-300 absolute inset-y-0 border-l-2 border-dashed',
              revealClassName
            )}
            style={{ left: `${percents.average * HORIZONTAL_TRACK_RATIO}%` }}
          />
        </div>
      </div>
    )
  }

  const lowPercent = Math.min(percents.footprint, percents.average)
  const highPercent = Math.max(percents.footprint, percents.average)

  return (
    <div
      role="img"
      aria-label={ariaLabel}
      aria-describedby={describedById}
      className={twMerge('mx-auto w-98 text-sm', className)}>
      {/* The top margin leaves room for the value above the tallest bar */}
      <div className="relative mt-9 h-52">
        <div
          className={twMerge(
            'border-primary-300 absolute right-0 left-16 border-t-2 border-dashed',
            revealClassName
          )}
          style={{ bottom: `${percents.average}%` }}
        />

        {deltaKg !== 0 && (
          <>
            <div
              className={twMerge(
                'absolute left-17 w-2 rounded-l-md border-2 border-r-0',
                colors.bracket,
                revealClassName
              )}
              style={{
                bottom: `${lowPercent}%`,
                height: `${highPercent - lowPercent}%`,
              }}
            />
            <span
              className={twMerge(
                'absolute left-0 w-16 translate-y-1/2 pr-1 text-right font-bold whitespace-nowrap tabular-nums',
                colors.text,
                revealClassName
              )}
              style={{ bottom: `${(lowPercent + highPercent) / 2}%` }}>
              {deltaLabel}
            </span>
          </>
        )}

        <div className="absolute inset-y-0 right-0 left-20 flex gap-6">
          {bars.map((bar) => (
            <div key={bar.key} className="relative flex w-22 items-end">
              <div
                className={twMerge(
                  'animate-bar-grow-vertical h-0 w-full rounded-t-xl rounded-b-sm motion-reduce:h-(--target-value)',
                  barGrowClassName,
                  bar.barClassName
                )}
                style={targetStyle(bar.percent, bar.delayMs)}
              />
              <span
                className={twMerge(
                  'absolute inset-x-0 mb-1.5 text-center text-lg font-bold whitespace-nowrap tabular-nums',
                  bar.valueClassName,
                  revealClassName
                )}
                style={{ bottom: `${bar.valuePercent ?? bar.percent}%` }}>
                {bar.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-2 ml-20 flex gap-6 leading-tight">
        {bars.map((bar) => (
          <span
            key={bar.key}
            className={twMerge('w-22 text-center', bar.nameClassName)}>
            {bar.name}
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
