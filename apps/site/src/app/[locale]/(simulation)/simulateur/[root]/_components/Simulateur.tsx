'use client'

import TopBar from '@/components/simulation/TopBar'
import {
  simulateurCloseSommaire,
  simulateurOpenSommaire,
} from '@/constants/tracking/pages/simulateur'
import { useAutoSaveSimulation } from '@/hooks/simulation/useAutoSaveSimulation'
import { useTrackSimulator } from '@/hooks/tracking/useTrackSimulator'
import { useDebug } from '@/hooks/useDebug'
import { useIframe } from '@/hooks/useIframe'
import { useEngine } from '@/publicodes-state'
import { trackMatomoEvent__deprecated } from '@/utils/analytics/trackEvent'
import { useCallback, useState } from 'react'
import { twMerge } from 'tailwind-merge'
import SimulateurSkeleton from '../skeleton'
import Form from './simulateur/Form'
import Summary from './simulateur/Summary'

export default function Simulateur() {
  useAutoSaveSimulation()
  useTrackSimulator()
  const { isInitialized } = useEngine()
  const { isIframe } = useIframe()

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
        'flex h-screen flex-1 flex-col overflow-scroll',
        isIframe && 'h-auto md:h-screen'
      )}>
      {!isInitialized ? (
        <SimulateurSkeleton />
      ) : (
        <>
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
              <Form />
            </div>
          </div>
        </>
      )}
    </div>
  )
}
