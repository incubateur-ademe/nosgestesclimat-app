import { ACTION_DETAIL_PATH } from '@/constants/urls/paths'
import { formatFootprint } from '@/helpers/formatters/formatFootprint'
import type { Locale } from '@/i18nConfig'
import type { Theme } from '@/types/themes'
import type { PersonalizedAction } from '@nosgestesclimat/core/features/actions/types/action'
import type { SimulationComputationStatus } from '@nosgestesclimat/core/features/simulation-computation/types/computation'
import Link from 'next/link'
import { twMerge } from 'tailwind-merge'
import Trans from '../../translation/trans/TransServer'
import { ThemeBadge } from '../ThemeBadge'

import styles from './ActionCard.module.css'

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

interface ActionCardProps extends React.ComponentPropsWithoutRef<'article'> {
  action: PersonalizedAction
  locale: Locale
  withThemeBadge?: boolean
  assessmentStatus?: SimulationComputationStatus | null
}

export default function ActionCard({
  action,
  className,
  locale,
  withThemeBadge = true,
  assessmentStatus,
  ...props
}: ActionCardProps) {
  return (
    <article
      {...props}
      className={twMerge(
        `relative flex min-h-38 flex-col gap-2 rounded-lg border border-t-8 bg-white p-2`,
        'translate-y-0 transition-[box-shadow_border-color_transform] duration-300 ease-out',
        'hover:-translate-y-0.5 hover:shadow-sm',
        'focus-within:-translate-y-0.5 focus-within:shadow-sm',
        classesByTheme[action.theme.key],
        className
      )}>
      {withThemeBadge ? (
        <ThemeBadge theme={action.theme} className="self-start" />
      ) : null}
      <div className="grow">
        <h3 className="mb-2 text-base/normal font-bold">{action.title}</h3>
        {action.assessment ? (
          <ImpactTag
            impact={action.assessment.impact}
            locale={locale}
            assessmentStatus={assessmentStatus}
          />
        ) : null}
      </div>
      <Link
        href={ACTION_DETAIL_PATH.replace(':actionSlug', action.slug)}
        className={twMerge(
          'focus-visible:inset-ring-primary-700 absolute -inset-px -top-2 z-10 rounded-lg',
          styles.actionLink
        )}>
        <span className="sr-only">
          <Trans
            locale={locale}
            i18nKey="actions.components.actionCard.link"
            values={{ actionTitle: action.title }}>
            Voir l'action "{action.title}"
          </Trans>
        </span>
      </Link>
      {/* <div className="-mx-2 border-t border-slate-100 px-2 pt-2">
        <Button color="secondary" size="sm" className="w-full">
          <PlusIcon className="stroke-primary-700 mr-2 size-4 fill-none" />
          Ajouter
        </Button>
      </div> */}
    </article>
  )
}

interface ImpactTagProps extends React.ComponentPropsWithoutRef<'span'> {
  impact?: number
  assessmentStatus?: SimulationComputationStatus | null
  locale: Locale
}

function ImpactTag({
  impact,
  locale,
  className,
  assessmentStatus,
  ...rest
}: ImpactTagProps) {
  let text

  if (
    assessmentStatus &&
    shouldDisplayComputationInProgressText(assessmentStatus)
  ) {
    text = (
      <Trans
        locale={locale}
        i18nKey="actions.components.actionCard.impactAssessmentInProgress">
        En cours de calcul
      </Trans>
    )
  } else if (typeof impact === 'number') {
    const { formattedValue, unit } = formatFootprint(-1 * impact, {
      locale,
      shouldUseAbbreviation: true,
      metric: 'carbone',
      unit: 't',
    })
    text = (
      <Trans
        locale={locale}
        i18nKey="actions.components.actionCard.impactTag"
        values={{ formattedValue, unit }}>
        Jusqu'à {'{{formattedValue}}'} {'{{unit}}'} CO<sub>2</sub>e / an
      </Trans>
    )
  } else {
    text = (
      <Trans
        locale={locale}
        i18nKey="actions.components.actionCard.noImpactTag">
        Impact non quantifiable
      </Trans>
    )
  }

  return (
    <span
      className={twMerge(
        `rounded-xl border border-slate-200 bg-white p-2 py-1.5 text-xs/none! font-bold whitespace-nowrap`,
        className
      )}
      {...rest}>
      {text}
    </span>
  )
}

function shouldDisplayComputationInProgressText(
  status: SimulationComputationStatus
) {
  switch (status) {
    case 'completed':
      return false
    case 'pending':
    case 'processing':
    case 'failed':
      return true
    default:
      status satisfies never
      return true
  }
}
