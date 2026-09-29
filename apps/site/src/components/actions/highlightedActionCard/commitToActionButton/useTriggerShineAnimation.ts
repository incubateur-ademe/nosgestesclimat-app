import type { ActionChoiceType } from '@nosgestesclimat/core/prisma/generated/enums'
import { useEffect, useState } from 'react'

const ANIMATION_DURATION = 1300

export function useTriggerShineAnimation(type?: ActionChoiceType) {
  const [shouldDisplayAnimation, setShouldDisplayAnimation] = useState(false)
  const [wasCommitted, setWasCommitted] = useState(type === 'committed')

  if (type === 'committed' && !wasCommitted) {
    setShouldDisplayAnimation(true)
    setWasCommitted(true)
  }

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
