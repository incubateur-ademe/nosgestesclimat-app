'use client'

import { useCallback, useRef, type KeyboardEvent } from 'react'

export type KeyboardNavigationOrientation = 'vertical' | 'horizontal'

interface UseMenuKeyboardNavigationOptions {
  /** Number of items in the menu / tab list. */
  itemCount: number
  /** Called when Escape is pressed inside the menu. */
  onEscape?: () => void
  /**
   * Navigation direction.
   * - `'vertical'` (default): ArrowUp / ArrowDown
   * - `'horizontal'`: ArrowLeft / ArrowRight
   */
  orientation?: KeyboardNavigationOrientation
  /** Called when the Home key is pressed (only in horizontal mode). */
  onHome?: () => void
  /** Called when the End key is pressed (only in horizontal mode). */
  onEnd?: () => void
}

/**
 * Handles keyboard navigation inside a menu or tab list.
 *
 * Supports both vertical (ArrowUp / ArrowDown) and horizontal
 * (ArrowLeft / ArrowRight) orientations with cycling and optional
 * Home / End keys.
 */
export function useMenuKeyboardNavigation({
  itemCount,
  onEscape,
  orientation = 'vertical',
  onHome,
  onEnd,
}: UseMenuKeyboardNavigationOptions) {
  const itemRefs = useRef<(HTMLElement | null)[]>(
    Array.from({ length: itemCount }).fill(null) as (HTMLElement | null)[]
  )

  const handleMenuKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onEscape?.()
        return
      }

      if (event.key === 'Home') {
        event.preventDefault()
        if (onHome) {
          onHome()
        } else {
          itemRefs.current[0]?.focus()
        }
        return
      }

      if (event.key === 'End') {
        event.preventDefault()
        if (onEnd) {
          onEnd()
        } else {
          itemRefs.current[itemCount - 1]?.focus()
        }
        return
      }

      const currentIndex = itemRefs.current.findIndex(
        (ref) => ref === document.activeElement
      )

      const isNext =
        orientation === 'vertical'
          ? event.key === 'ArrowDown'
          : event.key === 'ArrowRight'

      const isPrev =
        orientation === 'vertical'
          ? event.key === 'ArrowUp'
          : event.key === 'ArrowLeft'

      if (isNext) {
        event.preventDefault()
        const nextIndex = currentIndex < itemCount - 1 ? currentIndex + 1 : 0
        itemRefs.current[nextIndex]?.focus()
      }

      if (isPrev) {
        event.preventDefault()
        const prevIndex = currentIndex > 0 ? currentIndex - 1 : itemCount - 1
        itemRefs.current[prevIndex]?.focus()
      }
    },
    [itemCount, onEscape, orientation, onHome, onEnd]
  )

  const setItemRef = useCallback(
    (index: number) => (el: HTMLElement | null) => {
      itemRefs.current[index] = el
    },
    []
  )

  const focusFirstItem = useCallback(() => {
    itemRefs.current[0]?.focus()
  }, [])

  const focusLastItem = useCallback(() => {
    itemRefs.current[itemCount - 1]?.focus()
  }, [itemCount])

  return { handleMenuKeyDown, setItemRef, focusFirstItem, focusLastItem }
}
