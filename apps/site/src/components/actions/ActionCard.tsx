import ArrowNarrowRightIcon from '@/components/icons/ArrowNarrowRightIcon'
import Link from '@/components/Link'
import { getActionHref } from '@/helpers/actions/getActionHref'
import type { Locale } from '@/i18nConfig'
import type { Theme } from '@/types/themes'
import type { ActionEventSource } from '@/utils/analytics/trackUniqueEvent'
import type { AssessmentStatus } from '@nosgestesclimat/core/features/actions/services/get-personalized-actions-catalogue.service'
import type { MaybePersonalizedAction } from '@nosgestesclimat/core/features/actions/types/action'
import removeMarkdown from 'remove-markdown'
import { twMerge } from 'tailwind-merge'
import Trans from '../translation/trans/TransServer'
import styles from './ActionCardsomething/ActionCard.module.css'
import { ImpactTag } from './ActionCardsomething/ImpactTag'
import { rankToEmoji } from './ActionCardsomething/rankToEmoji'
import ActionTracker from './ActionTracker'
import CommitToActionButton from './highlightedActionCard/CommitToActionButton'
import { ThemeBadge } from './ThemeBadge'

const classesByTheme: Record<Theme['key'], string> = {
  transport:
    'border-transport-200 border-t-transport-400! hover:border-transport-300 focus-within:border-transport-300',
  food: 'border-alimentation-200 border-t-alimentation-400! hover:border-alimentation-300 focus-within:border-alimentation-300',
  housing:
    'border-logement-200 border-t-logement-400! hover:border-logement-300 focus-within:border-logement-300',
  misc: 'border-divers-200 border-t-divers-400! hover:border-divers-300 focus-within:border-divers-300',
  societal_services:
    'border-servicessocietaux-200 border-t-servicessocietaux-400! hover:border-servicessocietaux-300 focus-within:border-servicessocietaux-300',
}

export interface ActionCardProps extends React.ComponentPropsWithoutRef<'article'> {
  action: MaybePersonalizedAction
  locale: Locale
  withThemeBadge?: boolean
  assessmentStatus?: AssessmentStatus | null
  rank?: number
  from?: 'fin' | 'mon-espace' | 'index'
  source?: ActionEventSource
}

export interface ActionCardWithTempProps extends ActionCardProps {
  withCta?: boolean
  withDescription?: boolean
  shouldHideActionCommitFeature?: boolean
}

export default function ActionCard({
  action,
  className,
  locale,
  withThemeBadge = true,
  assessmentStatus,
  rank,
  from,
  source,
  withCta,
  withDescription,
  shouldHideActionCommitFeature,
  ...props
}: ActionCardWithTempProps) {
  const rankEmoji = rankToEmoji(rank)

  const href = getActionHref({
    from,
    action,
    locale,
  })

  const description = withDescription
    ? // slice to avoid sending more data than we display in the excerpt
      (action.description ??
      removeMarkdown(action.longDescription).slice(0, 100))
    : null

  return (
    <article
      {...props}
      className={twMerge(
        `relative flex min-h-38 flex-col gap-6 rounded-lg border border-t-8 bg-white`,
        'translate-y-0 transition-[box-shadow_border-color_transform] duration-300 ease-out',
        'hover:-translate-y-0.5 hover:shadow-sm',
        'focus-within:-translate-y-0.5 focus-within:shadow-sm',
        withCta ? 'min-h-50 focus-within:shadow-md hover:shadow-md' : null,
        classesByTheme[action.theme.key],
        className
      )}>
      {source !== 'cross-sell' ? (
        <ActionTracker eventName="displayed" action={action} />
      ) : null}

      <div
        className={twMerge(
          'flex grow flex-col gap-2 p-2',
          withCta ? 'px-4 pt-2 pb-0' : null
        )}>
        {rankEmoji || withThemeBadge ? (
          <div className="flex items-center">
            {rankEmoji ? <span className="">{rankEmoji}</span> : null}
            {withThemeBadge ? <ThemeBadge theme={action.theme} /> : null}
          </div>
        ) : null}
        <div className="grow">
          <h3 className="mb-2 text-base/normal font-bold">{action.title}</h3>

          {description ? (
            <p className="mb-2 line-clamp-2 text-sm/normal text-slate-600 md:line-clamp-3 md:text-base/normal">
              {description}
            </p>
          ) : null}

          {action.assessment ? (
            <ImpactTag
              impact={action.assessment.impact}
              locale={locale}
              assessmentStatus={assessmentStatus}
            />
          ) : null}
        </div>
      </div>

      {withCta && !action.assessment && (
        <>
          <div className="border-t border-slate-100 p-4">
            <span
              aria-hidden="true"
              className="text-primary-700 flex items-center text-sm/normal font-bold">
              <Trans
                locale={locale}
                i18nKey="actions.components.actionCard.link"
                values={{ actionTitle: action.title }}>
                Voir l'action
                <span className="sr-only"> "{'{{actionTitle}}'}"</span>
              </Trans>
              <ArrowNarrowRightIcon className="ml-1 h-2.5" />
            </span>
          </div>
          <Link
            href={href}
            className={twMerge(
              'focus-visible:inset-ring-primary-700 absolute -inset-px -top-2 z-10 rounded-lg',
              styles.actionLink
            )}>
            <span className="sr-only">
              <Trans
                locale={locale}
                i18nKey="actions.components.actionCard.link"
                values={{ actionTitle: action.title }}>
                Voir l'action
                <span className="sr-only"> "{'{{actionTitle}}'}"</span>
              </Trans>
            </span>
          </Link>
        </>
      )}

      {action.assessment && !shouldHideActionCommitFeature && (
        <div className="border-t border-slate-100 p-2">
          <CommitToActionButton
            className="w-full"
            actionId={action.id}
            actionChoiceType={action.choice?.type}
          />
        </div>
      )}
    </article>
  )
}
