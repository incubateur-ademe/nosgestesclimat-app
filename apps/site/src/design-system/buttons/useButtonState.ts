'use client'

import { useCallback, useState } from 'react'

export function useButtonState({
  disabled,
  loading,
  isClickableOnce,
}: {
  disabled?: boolean
  loading?: boolean
  isClickableOnce?: boolean
}) {
  const [isClicked, setIsClicked] = useState(false)

  const isDisabled = disabled || loading || (isClickableOnce && isClicked)

  const showLoader = loading || (isClickableOnce && isClicked)

  const clickOnce = useCallback(() => {
    if (isClickableOnce) setIsClicked(true)
  }, [isClickableOnce])

  return { isDisabled, showLoader, clickOnce }
}
