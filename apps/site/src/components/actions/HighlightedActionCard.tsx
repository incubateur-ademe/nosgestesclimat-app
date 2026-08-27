import { ACTION_DETAIL_PATH } from '@/constants/urls/paths'
import ButtonLinkServer from '@/design-system/buttons/ButtonLinkServer'
import { formatFootprint } from '@/helpers/formatters/formatFootprint'
import { getLocalizedPath } from '@/helpers/language/getLocalizedPath'
import { LOCALE_EN_KEY, LOCALE_FR_KEY, type Locale } from '@/i18nConfig'
import type { Theme } from '@/types/themes'
import type { MaybePersonalizedAction } from '@nosgestesclimat/core/features/actions/types/action'
import type { SimulationComputationStatus } from '@nosgestesclimat/core/features/simulation-computation/types/computation'
import Link from 'next/link'
import { twMerge } from 'tailwind-merge'
import ArrowNarrowRightIcon from '../icons/ArrowNarrowRightIcon'
import Trans from '../translation/trans/TransServer'
import ActionTracker from './ActionTracker'
import { ThemeBadge } from './ThemeBadge'
import { shouldDisplayComputationInProgressText } from './utils/shouldDisplayComputationInProgressText'

const classesByTheme: Record<
  Theme['key'],
  Record<'card' | 'panel' | 'value', string>
> = {
  transport: {
    card: 'border-transport-200 border-t-transport-400 md:border-t-transport-200 md:border-l-transport-400',
    panel: 'bg-transport-50',
    value: 'text-transport-900',
  },
  food: {
    card: 'border-alimentation-200 border-t-alimentation-400 md:border-t-alimentation-200 md:border-l-alimentation-400',
    panel: 'bg-alimentation-50',
    value: 'text-alimentation-900',
  },
  housing: {
    card: 'border-logement-200 border-t-logement-400 md:border-t-logement-200 md:border-l-logement-400',
    panel: 'bg-logement-50',
    value: 'text-logement-900',
  },
  misc: {
    card: 'border-divers-200 border-t-divers-400 md:border-t-divers-200 md:border-l-divers-400',
    panel: 'bg-divers-50',
    value: 'text-divers-900',
  },
  societal_services: {
    card: 'border-servicessocietaux-200 border-t-servicessocietaux-400 md:border-t-servicessocietaux-200 md:border-l-servicessocietaux-400',
    panel: 'bg-servicessocietaux-50',
    value: 'text-servicessocietaux-900',
  },
}

interface HighlightedActionCardProps extends React.ComponentPropsWithoutRef<'article'> {
  action: MaybePersonalizedAction
  locale: Locale
  assessmentStatus?: SimulationComputationStatus | null
  rank?: number
  from?: 'fin' | 'mon-espace' | 'index'
  /** Total carbon footprint in kg, used to express the impact as a share of it */
  totalFootprint?: number
}

export default function HighlightedActionCard({
  action,
  className,
  locale,
  assessmentStatus,
  rank,
  from,
  totalFootprint,
  ...props
}: HighlightedActionCardProps) {
  const classes = classesByTheme[action.theme.key]
  const actionDetailPath = ACTION_DETAIL_PATH(action.theme.slug, action.slug)
  // On an /en page, an unprefixed (fr) path would be redirected to /en by the
  // locale middleware, so force the /fr prefix instead of relying on
  // getLocalizedPath's "no prefix for the default locale" behavior.
  const actionPath =
    locale === LOCALE_EN_KEY && action.language === LOCALE_FR_KEY
      ? `/${LOCALE_FR_KEY}${actionDetailPath}`
      : getLocalizedPath(action.language, actionDetailPath)
  const href = from ? `${actionPath}?from=${from}` : actionPath
  const description = action.metadata.description

  return (
    <article
      {...props}
      className={twMerge(
        'relative flex flex-col overflow-hidden rounded-lg border border-t-8 bg-white md:flex-row md:border-t md:border-l-8',
        classes.card,
        className
      )}>
      <ActionTracker eventName="displayed" action={action} />

      <div className="flex flex-1 flex-col gap-4 p-4">
        <div className="flex items-center gap-2">
          <RankBadge rank={rank} />
          <ThemeBadge theme={action.theme} className="text-sm" />
        </div>

        <div className="flex flex-col gap-2">
          <h3 className="mb-0 text-xl/normal font-bold">
            <Link
              href={href}
              className="text-inherit no-underline hover:underline">
              {action.title}
            </Link>
          </h3>
          {description ? (
            <p className="mb-0 line-clamp-2 max-w-[80ch] text-base/normal text-slate-600">
              {description}
            </p>
          ) : null}
        </div>

        <div className="flex">
          <ButtonLinkServer href={href} size="sm" className="h-12 gap-2 px-6">
            <Trans
              locale={locale}
              i18nKey="actions.components.actionCard.highlighted.link">
              Voir l'action
            </Trans>
            {/* The three cards share the same visible label, so name the
                action for screen readers reaching the link out of context. */}
            <span className="sr-only">{` "${action.title}"`}</span>
            <ArrowNarrowRightIcon />
          </ButtonLinkServer>
        </div>
      </div>

      {assessmentStatus ? (
        <div
          className={twMerge(
            'flex flex-col justify-center gap-0.5 border-t border-slate-100 px-6 py-6 md:w-75 md:border-t-0 md:border-l',
            classes.panel
          )}>
          <p className="mb-0 text-sm/normal font-bold text-slate-600 uppercase">
            <Trans
              locale={locale}
              i18nKey="actions.components.actionCard.highlighted.potentialImpact">
              Impact potentiel
            </Trans>
          </p>
          <ImpactValue
            impact={action.assessment?.impact}
            locale={locale}
            assessmentStatus={assessmentStatus}
            valueClassName={classes.value}
          />
          <FootprintShare
            impact={action.assessment?.impact}
            totalFootprint={totalFootprint}
            locale={locale}
          />
        </div>
      ) : null}
    </article>
  )
}

interface ImpactValueProps {
  impact?: number
  assessmentStatus: SimulationComputationStatus
  locale: Locale
  valueClassName: string
}

function ImpactValue({
  impact,
  locale,
  assessmentStatus,
  valueClassName,
}: ImpactValueProps) {
  if (shouldDisplayComputationInProgressText(assessmentStatus)) {
    return (
      <p className="mb-0 text-base/normal font-bold text-slate-600">
        <Trans
          locale={locale}
          i18nKey="actions.components.actionCard.impactAssessmentInProgress">
          En cours de calcul
        </Trans>
      </p>
    )
  }

  if (typeof impact !== 'number') {
    return (
      <p className="mb-0 text-base/normal font-bold text-slate-600">
        <Trans
          locale={locale}
          i18nKey="actions.components.actionCard.noImpactTag">
          Impact non quantifiable
        </Trans>
      </p>
    )
  }

  const { formattedValue, unit } = formatFootprint(impact, {
    locale,
    shouldUseAbbreviation: true,
    metric: 'carbone',
    unit: 't',
  })

  return (
    <p className="mb-0 flex items-baseline gap-1.5 whitespace-nowrap">
      <span
        className={twMerge(
          'text-[2rem]/none font-extrabold tracking-[-0.9px] md:text-5xl/none',
          valueClassName
        )}>
        {formattedValue} {unit}
      </span>
      <span className="text-xs/none font-bold text-slate-600">
        <Trans
          locale={locale}
          i18nKey="actions.components.actionCard.highlighted.impactUnit">
          CO<sub>2</sub>e / an
        </Trans>
      </span>
    </p>
  )
}

interface FootprintShareProps {
  impact?: number
  totalFootprint?: number
  locale: Locale
}

function FootprintShare({
  impact,
  totalFootprint,
  locale,
}: FootprintShareProps) {
  if (
    typeof impact !== 'number' ||
    typeof totalFootprint !== 'number' ||
    totalFootprint <= 0
  ) {
    return null
  }

  const percentage = Math.round((impact / totalFootprint) * 100)

  if (percentage <= 0) {
    return null
  }

  return (
    <p className="mb-0 text-sm/normal font-bold text-slate-600">
      <Trans
        locale={locale}
        i18nKey="actions.components.actionCard.highlighted.footprintShare"
        values={{ percentage }}>
        soit {'{{percentage}}'} % de votre empreinte totale
      </Trans>
    </p>
  )
}

const gradientByRank: Record<number, string> = {
  1: 'linear-gradient(159deg, #f7c666 0%, #e9b142 100%)',
  2: 'linear-gradient(159deg, #f3f6fc 0%, #c9d0dc 100%)',
  3: 'linear-gradient(159deg, #e6b387 0%, #c69062 100%)',
}

function RankBadge({ rank }: { rank?: number }) {
  const background = rank ? gradientByRank[rank] : undefined

  if (!background) {
    return null
  }

  return (
    <span
      aria-hidden="true"
      className="flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-extrabold text-slate-800"
      style={{ background }}>
      {rank}
    </span>
  )
}
