'use client'

import type { DottedName } from '@incubateur-ademe/nosgestesclimat'
import { usePathname, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'
import { pushStep } from './pushStep'
import {
  type Step,
  questionFromParam,
  resolveCurrentStep,
  stepToUrl,
} from './steps'

interface Props {
  relevantAnsweredQuestions: DottedName[]
  remainingQuestions: DottedName[]
  isDebug: boolean
}

/** The current step, kept with the URL it was read from. */
interface Current {
  step: Step | undefined
  pathname: string
  questionParam: string | null
}

/**
 * The current step, mirrored into `?question=`, adopting URLs that change from
 * outside the form (a deep link, the browser's back button).
 */
export function useCurrentStep({
  relevantAnsweredQuestions,
  remainingQuestions,
  isDebug,
}: Props) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const questionParam = searchParams.get('question')

  const stepInUrl = () =>
    resolveCurrentStep({
      pathname,
      questionParam,
      relevantAnsweredQuestions,
      remainingQuestions,
      isDebug,
    })

  const [current, setCurrent] = useState<Current>(() => ({
    step: stepInUrl(),
    pathname,
    questionParam,
  }))

  // Read the URL once per change. `useSearchParams` trails `pushState` by a
  // render, so re-reading the URL we are leaving would undo the navigation.
  if (
    current.pathname !== pathname ||
    current.questionParam !== questionParam
  ) {
    const namesCurrentStep =
      current.step?.kind === 'question' &&
      questionFromParam(questionParam) === current.step.question
    setCurrent({
      step: namesCurrentStep ? current.step : stepInUrl(),
      pathname,
      questionParam,
    })
  }

  const currentStepRef = useRef(current.step)
  useEffect(() => {
    currentStepRef.current = current.step
  }, [current.step])

  const navigate = useCallback(
    (step: Step) => {
      currentStepRef.current = step
      setCurrent({ step, pathname, questionParam })
      pushStep(step, searchParams)
    },
    [pathname, questionParam, searchParams]
  )

  const getCurrentStep = useCallback(() => currentStepRef.current, [])

  // Mirror navigations that bypass navigate(), and keep the URL valid when the
  // current question leaves the form.
  useEffect(() => {
    if (!current.step) return
    const currentUrl = stepToUrl(current.step, searchParams)
    if (`${pathname}${window.location.search}` !== currentUrl) {
      window.history.replaceState(null, '', currentUrl)
    }
  }, [current.step, pathname, searchParams])

  return { currentStep: current.step, navigate, getCurrentStep }
}
