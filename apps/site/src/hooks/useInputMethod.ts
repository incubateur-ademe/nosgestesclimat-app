'use client'

import { useCallback, useEffect, useState } from 'react'

/**
 * Detects whether the user is navigating with keyboard or mouse.
 *
 * This is useful for showing/hiding focus rings (focus-visible polyfill)
 * or for differentiating keyboard vs mouse interactions in dropdowns.
 */
export function useInputMethod() {
  const [isKeyboardNavigation, setIsKeyboardNavigation] = useState(false)

  useEffect(() => {
    function handleKeyDown() {
      setIsKeyboardNavigation(true)
    }

    function handleMouseDown() {
      setIsKeyboardNavigation(false)
    }

    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('mousedown', handleMouseDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('mousedown', handleMouseDown)
    }
  }, [])

  const setKeyboardInputMethod = useCallback((value: boolean) => {
    setIsKeyboardNavigation(value)
  }, [])

  return { isKeyboardNavigation, setKeyboardInputMethod }
}
