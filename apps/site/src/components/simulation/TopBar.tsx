'use client'

import { useIframe } from '@/hooks/useIframe'
import { useFormState } from '@/publicodes-state'
import { twMerge } from 'tailwind-merge'
import TotalFootprintNumber from '../misc/TotalFootprintNumber'
import ButtonBack from './topBar/ButtonBack'
import Category from './topBar/Category'
import Progress from './topBar/Progress'
import TotalButtons from './topBar/TotalButtons'

export default function TopBar({
  toggleQuestionList,
  simulationMode = true,
  showTotal = false,
  className,
}: {
  toggleQuestionList?: () => void
  simulationMode?: boolean
  showTotal?: boolean
  className?: string
}) {
  const { isIframe, isIframeOnlySimulation } = useIframe()

  const { currentCategory } = useFormState()

  return (
    <header
      className={twMerge(
        'sticky top-0 z-50 h-16 w-full bg-white',
        !simulationMode && 'static z-0 bg-white',
        className
      )}>
      <div
        className={twMerge(
          'relative flex h-full items-center gap-4 overflow-visible pt-2 pb-3 lg:pt-4 lg:pb-5',
          !simulationMode && 'border-primary-100 border-b'
        )}>
        {simulationMode && <Progress />}

        <div className="mb-0 flex w-full max-w-5xl justify-between overflow-visible pr-4 pl-1 lg:mx-auto lg:px-4">
          <div className="relative flex items-center gap-1 lg:gap-4">
            {simulationMode && !isIframe && !isIframeOnlySimulation && (
              <ButtonBack />
            )}
            {showTotal ? (
              <TotalFootprintNumber
                size="lg"
                className="flex-row items-baseline bg-white md:gap-1"
              />
            ) : (
              <Category category={currentCategory} />
            )}
          </div>
          {toggleQuestionList ? (
            <TotalButtons toggleQuestionList={toggleQuestionList} />
          ) : null}
        </div>
      </div>
    </header>
  )
}
