import Trans from '@/components/translation/trans/TransServer'
import Emoji from '@/design-system/utils/Emoji'
import type { Locale } from '@/i18nConfig'
import type { EventStatusWithoutNotStarted } from '../../../../_types/event'

interface Props {
  progressPercentage: number
  status: EventStatusWithoutNotStarted
  locale: Locale
}

export default function ObjectiveStatus({
  progressPercentage,
  status,
  locale,
}: Props) {
  if (progressPercentage > 100) {
    return (
      <span>
        <Trans i18nKey="event.dynamicCounter.target.title.over" locale={locale}>
          Objectif dépassé
        </Trans>{' '}
        {status === 'ended' ? '✅' : '🚀'}
      </span>
    )
  }

  if (progressPercentage === 100) {
    return (
      <span>
        <Trans
          i18nKey="event.dynamicCounter.target.title.topped"
          locale={locale}>
          Objectif atteint
        </Trans>{' '}
        <Emoji>🚀</Emoji>
      </span>
    )
  }

  return (
    <Trans i18nKey="event.dynamicCounter.target.title.default" locale={locale}>
      Objectif
    </Trans>
  )
}
