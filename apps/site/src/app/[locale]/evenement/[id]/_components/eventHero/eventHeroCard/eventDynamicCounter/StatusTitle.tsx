import Trans from '@/components/translation/trans/TransServer'
import type { Locale } from '@/i18nConfig'
import { cn } from 'cn'
import type { EventStatusWithoutNotStarted } from '../../../../_types/event'

interface Props {
  status: EventStatusWithoutNotStarted
  locale: Locale
}

const STATUS_CLASSES: Record<
  EventStatusWithoutNotStarted,
  { text: string; background: string }
> = {
  inProgress: {
    text: 'text-green-700',
    background: 'bg-green-700',
  },
  ended: {
    text: 'text-red-700',
    background: 'bg-red-700',
  },
}

export default function StatusTitle({ status, locale }: Props) {
  return (
    <span className={cn('mb-4 flex items-center', STATUS_CLASSES[status].text)}>
      <span
        aria-hidden
        className={cn(
          'mr-2 inline-block h-2 w-2 animate-pulse rounded-full align-baseline motion-reduce:animate-none',
          STATUS_CLASSES[status].background,
          status === 'ended' && 'animate-none'
        )}
      />

      <span className="text-xs font-bold uppercase">
        {status === 'inProgress' ? (
          <Trans i18nKey="event.dynamicCounter.text.running" locale={locale}>
            EN DIRECT
          </Trans>
        ) : (
          <Trans i18nKey="event.dynamicCounter.text.ended" locale={locale}>
            Le défi est terminé, mais la mobilisation continue !
          </Trans>
        )}
      </span>
    </span>
  )
}
