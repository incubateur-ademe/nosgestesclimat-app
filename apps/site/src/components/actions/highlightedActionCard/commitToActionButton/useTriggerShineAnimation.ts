import type { ActionChoiceType } from '@nosgestesclimat/core/prisma/generated/enums'
import { useEffect, useRef, useState } from 'react'

const ANIMATION_DURATION = 1300

export function useTriggerShineAnimation(type?: ActionChoiceType) {
  const [shouldDisplayAnimation, setShouldDisplayAnimation] = useState(false)
  const wasCommitted = useRef(type === 'committed')
  useEffect(() => {
    const isCommitted = type === 'committed'
    if (isCommitted && !wasCommitted.current) setShouldDisplayAnimation(true)
    wasCommitted.current = isCommitted
  }, [type])

  useEffect(() => {
    let timeoutBeforeDisablingAnimation = undefined
    if (shouldDisplayAnimation) {
      timeoutBeforeDisablingAnimation = setTimeout(() => {
        setShouldDisplayAnimation(false)
      }, ANIMATION_DURATION)
    }

    return () => clearTimeout(timeoutBeforeDisablingAnimation)
  }, [shouldDisplayAnimation])

  return type ? shouldDisplayAnimation : false
}
