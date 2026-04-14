'use client'

import TopBar from '@/components/simulation/TopBar'
import {
  simulateurCloseSommaire,
  simulateurOpenSommaire,
} from '@/constants/tracking/pages/simulateur'
import { useTrackSimulator } from '@/hooks/tracking/useTrackSimulator'
import { useIframe } from '@/hooks/useIframe'
import { useEngine } from '@/publicodes-state'
import { trackMatomoEvent__deprecated } from '@/utils/analytics/trackEvent'
import { useCallback, useState } from 'react'
import { twMerge } from 'tailwind-merge'
import Simulateur from './_components/Simulateur'
import { useSimulatorGuard } from './_hooks/useSimulatorGuard'

export default function SimulateurPage() {
  const { isRedirecting } = useSimulatorGuard()
  const { isInitialized } = useEngine()
  const { isIframe } = useIframe()

  // We track the progression of the user in the simulation
  useTrackSimulator()

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

  return (
    <div
      className={twMerge(
        'flex h-screen flex-1 flex-col overflow-scroll',
        isIframe && 'h-auto md:h-screen'
      )}>
      <TopBar toggleQuestionList={toggleQuestionList} />

      <Simulateur
        toggleQuestionList={toggleQuestionList}
        isQuestionListOpen={isQuestionListOpen}
        isLoading={isRedirecting || !isInitialized}
      />
    </div>
  )
}
