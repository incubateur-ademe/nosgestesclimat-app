import ButtonLinkServer from '@/design-system/buttons/ButtonLinkServer'
import Link from '@/design-system/links/Link'
import { getActionHref } from '@/helpers/actions/getActionHref'
import { type Locale } from '@/i18nConfig'
import type { Theme } from '@/types/themes'
import type { MaybePersonalizedAction } from '@nosgestesclimat/core/features/actions/types/action'
import { twMerge } from 'tailwind-merge'
import ArrowNarrowRightIcon from '../icons/ArrowNarrowRightIcon'
import Trans from '../translation/trans/TransServer'
import ActionTracker from './ActionTracker'
import CommitToActionButton from './highlightedActionCard/CommitToActionButton'
import ImpactSection from './highlightedActionCard/ImpactSection'
import { ThemeBadge } from './ThemeBadge'

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

export interface HighlightedActionCardProps extends React.ComponentPropsWithoutRef<'article'> {
  action: MaybePersonalizedAction
  locale: Locale
  rank?: number
  from?: 'fin' | 'mon-espace' | 'index'
  /** Total carbon footprint in kg, used to express the impact as a share of it */
  totalFootprint?: number
  shouldHideActionCommitFeature?: boolean
}

export default function HighlightedActionCard({
  action,
  className,
  locale,
  rank,
  from,
  totalFootprint,
  shouldHideActionCommitFeature,
  ...props
}: HighlightedActionCardProps) {
  const classes = classesByTheme[action.theme.key]

  const href = getActionHref({
    from,
    action,
    locale,
  })

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
              prefetch={true}
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

        <div className="flex gap-4">
          <ButtonLinkServer
            href={href}
            prefetch={true}
            size="sm"
            className="h-12 gap-2 px-6">
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

          {action.assessment && !shouldHideActionCommitFeature && (
            <CommitToActionButton shortLabelDisplayed action={action} />
          )}
        </div>
      </div>

      <ImpactSection totalFootprint={totalFootprint} classes={classes} />
    </article>
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
