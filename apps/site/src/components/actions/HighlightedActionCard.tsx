import ButtonLinkServer from '@/design-system/buttons/ButtonLinkServer'
import Link from '@/design-system/links/Link'
import { getActionHref } from '@/helpers/actions/getActionHref'
import { type Locale } from '@/i18nConfig'
import type { MaybePersonalizedAction } from '@nosgestesclimat/core/features/actions/types/action'
import { twMerge } from 'cn'
import ArrowNarrowRightIcon from '../icons/ArrowNarrowRightIcon'
import Trans from '../translation/trans/TransServer'
import ActionTracker from './ActionTracker'
import CommitToActionButton from './highlightedActionCard/CommitToActionButton'
import ImpactSection from './highlightedActionCard/ImpactSection'
import { classesByTheme } from './highlightedActionCard/impactSection/classes-by-theme'
import { ThemeBadge } from './ThemeBadge'
import type { ActionCatalogueContext } from './types/actions'

export interface HighlightedActionCardProps extends React.ComponentPropsWithoutRef<'article'> {
  action: MaybePersonalizedAction
  locale: Locale
  rank?: number
  from?: 'fin' | 'mon-espace' | 'index'
  actionCatalogueContext: ActionCatalogueContext
}

export default function HighlightedActionCard({
  action,
  className,
  locale,
  rank,
  from,
  actionCatalogueContext,
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

        <div className="flex flex-col items-start gap-4 md:flex-row">
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

          {action.assessment && <CommitToActionButton action={action} />}
        </div>
      </div>

      <ImpactSection
        themeKey={action.theme.key}
        assessment={action.assessment}
        actionCatalogueContext={actionCatalogueContext}
      />
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
