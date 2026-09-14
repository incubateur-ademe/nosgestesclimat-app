'use client'

import TopBar from '@/components/simulation/TopBar'
import {
  simulateurCloseSommaire,
  simulateurOpenSommaire,
} from '@/constants/tracking/pages/simulateur'
import { useDebug } from '@/hooks/useDebug'
import { useIframe } from '@/hooks/useIframe'
import { useIsClient } from '@/hooks/useIsClient'
import { useFormState } from '@/publicodes-state'
import { trackMatomoEvent__deprecated } from '@/utils/analytics/trackEvent'
import { useCallback, useState } from 'react'
import { twMerge } from 'tailwind-merge'
import Summary from './Summary'
import SimulateurSkeleton from './skeleton'

export default function SimulateurLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isIframe } = useIframe()
  const { currentCategory } = useFormState()

  // The engine — and therefore the current category — only exists on the client
  // (see `useEngine`), so the skeleton must stay until the client has taken
  // over: on the first client render the category is already known, and the
  // skeleton rendered by the server would be swapped during hydration.
  const isClient = useIsClient()
  const isInitialized = isClient && !!currentCategory

  const [isQuestionListOpen, setIsQuestionListOpen] = useState(false)
  const toggleQuestionList = useCallback(() => {
    setIsQuestionListOpen((prevIsQuestionListOpen) => {
      trackMatomoEvent__deprecated(
        prevIsQuestionListOpen
          ? simulateurCloseSommaire
          : simulateurOpenSommaire
      )
      return !prevIsQuestionListOpen
    })
  }, [])
  const isDebug = useDebug()

  return (
    <div
      className={twMerge(
        'flex min-h-screen flex-1 flex-col',
        isIframe && 'h-auto md:min-h-screen'
      )}>
      <TopBar toggleQuestionList={toggleQuestionList} />

      <div className="flex flex-1 flex-col pb-20 md:pt-8 lg:px-0">
        {isQuestionListOpen && isDebug && (
          <Summary
            toggleQuestionList={toggleQuestionList}
            isQuestionListOpen={isQuestionListOpen}
          />
        )}

        <div
          className={twMerge(
            'flex flex-1 flex-col md:pt-8',
            isQuestionListOpen && !isDebug ? 'hidden' : 'flex'
          )}>
          {!isInitialized ? <SimulateurSkeleton /> : null}
          <div className={!isInitialized ? 'hidden' : ''}>{children}</div>
        </div>
      </div>
    </div>
  )
}
