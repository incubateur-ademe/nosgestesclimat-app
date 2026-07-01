'use client'

import { useCallback, useEffect, useId, useRef, useState } from 'react'

interface UseDropdownOptions {
  /**
   * Called when the dropdown opens.
   */
  onOpen?: () => void
  /**
   * Called when the dropdown closes.
   */
  onClose?: () => void
  /**
   * When `true`, locks the body scroll (`document.body.style.overflow =
   * 'hidden'`) while the dropdown is open. Useful for modals, full-screen
   * menus or overlays.
   *
   * @default false
   */
  lockBodyScroll?: boolean
}

/**
 * Generic dropdown state management.
 *
 * Handles open/close state, click outside detection, Escape key,
 * focus restoration, blur/focusout, and ARIA IDs.
 */
export function useDropdown(options?: UseDropdownOptions) {
  const {
    onOpen: onOpenCallback,
    onClose: onCloseCallback,
    lockBodyScroll = false,
  } = options ?? {}

  const [isOpen, setIsOpen] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const buttonId = useId()
  const menuId = useId()

  const open = useCallback(() => {
    setIsOpen(true)
    onOpenCallback?.()
  }, [onOpenCallback])

  const close = useCallback(() => {
    setIsOpen(false)
    onCloseCallback?.()
  }, [onCloseCallback])

  const toggle = useCallback(() => {
    setIsOpen((prev) => {
      if (prev) {
        onCloseCallback?.()
      } else {
        onOpenCallback?.()
      }
      return !prev
    })
  }, [onCloseCallback, onOpenCallback])

  // Lock / unlock body scroll
  useEffect(() => {
    if (!lockBodyScroll) return

    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'auto'
    }

    return () => {
      document.body.style.overflow = 'auto'
    }
  }, [isOpen, lockBodyScroll])

  // Click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        isOpen &&
        menuRef.current &&
        buttonRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        close()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
  }, [isOpen, close])

  // Escape key — close and restore focus to the trigger button
  useEffect(() => {
    function handleEscape(event: globalThis.KeyboardEvent) {
      if (event.key === 'Escape' && isOpen) {
        close()
        buttonRef.current?.focus()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      return () => {
        document.removeEventListener('keydown', handleEscape)
      }
    }
  }, [isOpen, close])

  // Close on blur / focusout
  useEffect(() => {
    function handleFocusOut(event: FocusEvent) {
      if (
        isOpen &&
        menuRef.current &&
        buttonRef.current &&
        !menuRef.current.contains(event.relatedTarget as Node) &&
        !buttonRef.current.contains(event.relatedTarget as Node)
      ) {
        close()
      }
    }

    if (isOpen) {
      const menu = menuRef.current
      const button = buttonRef.current

      if (menu && button) {
        menu.addEventListener('focusout', handleFocusOut)
        button.addEventListener('focusout', handleFocusOut)

        return () => {
          menu.removeEventListener('focusout', handleFocusOut)
          button.removeEventListener('focusout', handleFocusOut)
        }
      }
    }
  }, [isOpen, close])

  return {
    isOpen,
    setIsOpen,
    open,
    close,
    toggle,
    buttonRef,
    menuRef,
    buttonId,
    menuId,
  }
}
