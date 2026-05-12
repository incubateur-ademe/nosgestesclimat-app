'use client'

import Navigation from '@/components/form/Navigation'
import Question from '@/components/form/Question'
import ContentLarge from '@/components/layout/ContentLarge'
import questions from '@/components/specialQuestions'
import { getBgCategoryColor } from '@/helpers/getCategoryColorClass'
import { useIframe } from '@/hooks/useIframe'

import CategoryIllustration from '@/app/[locale]/simulateur/(simulator-flow)/bilan/_components/summary/CategoryIllustration'
import { useFormState } from '@/publicodes-state'
import { useEffect } from 'react'
import { twMerge } from 'tailwind-merge'
import { useEndTest } from '../_hooks/useEndPage'
import FunFact from './form/FunFact'
import ResultsBlocksDesktop from './form/ResultsBlockDesktop'
import ResultsBlockMobile from './form/ResultsBlockMobile'

export default function Form() {
  const {
    remainingQuestions,
    currentQuestion,

    currentCategory,
  } = useFormState()

  const { endTest, isPending } = useEndTest()

  const { isIframe } = useIframe()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [currentQuestion])

  if (!currentQuestion) {
    return
  }

  const QuestionComponent = questions[currentQuestion] || Question

  return (
    <>
      <ContentLarge className="px-4 pt-2">
        <ResultsBlockMobile />

        <div className="relative flex flex-1 flex-col gap-2 md:flex-row md:gap-8 lg:mt-0 lg:gap-12">
          <div className="relative flex flex-1 flex-col">
            <QuestionComponent
              question={currentQuestion}
              key={currentQuestion}
            />

            {isIframe && (
              <Navigation
                key="iframe-navigation"
                question={currentQuestion}
                remainingQuestions={remainingQuestions}
                onComplete={endTest}
                isPending={isPending}
              />
            )}
          </div>

          <div
            className={`short:gap-2 flex flex-col gap-8 md:w-60 md:self-start md:${getBgCategoryColor(currentCategory ?? 'transport', '500')}`}>
            <ResultsBlocksDesktop />

            <FunFact question={currentQuestion} />

            <div
              className={twMerge(
                'mt-auto mb-8 pb-16 md:pb-0',
                isIframe && 'hidden'
              )}>
              <CategoryIllustration category={currentCategory ?? 'transport'} />
            </div>
          </div>
        </div>
      </ContentLarge>

      {!isIframe && (
        <Navigation
          key="default-navigation"
          question={currentQuestion}
          remainingQuestions={remainingQuestions}
          onComplete={endTest}
          isPending={isPending}
        />
      )}
    </>
  )
}
