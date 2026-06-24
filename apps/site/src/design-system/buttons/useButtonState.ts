'use client'

import { useCallback, useState, useTransition } from 'react'

export function useButtonState({
  disabled,
  loading,
  showLoadingOnClick,
}: {
  disabled?: boolean
  loading?: boolean
  showLoadingOnClick?: boolean
}) {
  const [isClicked, setIsClicked] = useState(false)
  const [isPending, startTransition] = useTransition()

  const isDisabled =
    disabled || loading || (showLoadingOnClick && (isPending || isClicked))

  const showLoader = loading || (showLoadingOnClick && (isPending || isClicked))

  const clickOnce = useCallback(() => {
    if (showLoadingOnClick) setIsClicked(true)
  }, [showLoadingOnClick])

  return { isDisabled, showLoader, clickOnce, isPending, startTransition }
}
