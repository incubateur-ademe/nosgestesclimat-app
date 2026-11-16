'use client'
import { useFormAdvancement, useCustomQuestion } from '@/form-controller'

import Navigation from '@/components/form/Navigation'
import Question from '@/components/form/Question'
import ContentLarge from '@/components/layout/ContentLarge'
import { getBgCategoryColor } from '@/helpers/getCategoryColorClass'
import { useIframe } from '@/hooks/useIframe'

import CategoryIllustration from '@/app/[locale]/simulateur/(simulator-flow)/(root)/bilan/_components/summary/CategoryIllustration'
import { useIsClient } from '@/hooks/useIsClient'
import { cn } from 'cn'
import { useEffect } from 'react'
import FunFact from './form/FunFact'
import ResultsBlocksDesktop from './form/ResultsBlockDesktop'
import ResultsBlockMobile from './form/ResultsBlockMobile'

export default function Form() {
  const { currentQuestion, currentCategory } = useFormAdvancement()
  const customQuestion = useCustomQuestion()

  const { isIframe } = useIframe()

  // The current question comes from the engine, which only exists on the client
  // (see `useEngine`): the server has none, so it would render nothing where
  // the client renders the question. `SimulateurLayout` shows the skeleton until
  // the mount, so waiting here costs no visible frame.
  const isClient = useIsClient()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [currentQuestion])

  if (!isClient || !currentQuestion) {
    return null
  }

  return (
    <>
      <ContentLarge className="px-4 pt-2">
        <ResultsBlockMobile />

        <div className="relative flex flex-1 flex-col gap-2 md:flex-row md:gap-8 lg:mt-0 lg:gap-12">
          <div className="relative flex flex-1 flex-col">
            {customQuestion ? (
              <customQuestion.Renderer
                question={customQuestion.question}
                draft={customQuestion.draft}
                onChange={customQuestion.onChange}
                key={currentQuestion}
              />
            ) : (
              <Question question={currentQuestion} key={currentQuestion} />
            )}

            {isIframe && <Navigation key="iframe-navigation" />}
          </div>

          <div
            className={`short:gap-2 flex flex-col gap-8 md:w-60 md:self-start md:${getBgCategoryColor(currentCategory ?? 'transport', '500')}`}>
            <ResultsBlocksDesktop />

            <FunFact question={currentQuestion} />

            <div
              className={cn(
                'mt-auto mb-8 pb-16 md:pb-0',
                isIframe && 'hidden'
              )}>
              <CategoryIllustration category={currentCategory ?? 'transport'} />
            </div>
          </div>
        </div>
      </ContentLarge>

      {!isIframe && <Navigation key="default-navigation" />}
    </>
  )
}
