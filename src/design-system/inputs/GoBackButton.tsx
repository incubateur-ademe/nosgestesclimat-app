'use client'

import Trans from '@/components/translation/trans/TransClient'
import { trackMatomoEvent__deprecated } from '@/utils/analytics/trackEvent'

interface Props {
  className?: string
  eventTracked?: (string | null)[]
}

export default function GoBackButton({ className, eventTracked }: Props) {
  return (
    <button
      onClick={() => {
        if (eventTracked) {
          trackMatomoEvent__deprecated(eventTracked)
        }
        if (typeof window !== 'undefined') {
          window.history.back()
        }
      }}
      className={`${className} text-primary-700 inline-block px-0 text-[1rem]! no-underline transition-opacity hover:opacity-80`}>
      ← <Trans>Retour</Trans>
    </button>
  )
}
