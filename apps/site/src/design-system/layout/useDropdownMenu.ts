'use client'

import { type RefObject, useEffect, useId, useRef, useState } from 'react'

export type DropdownMenuButtonRef = RefObject<HTMLButtonElement | null>

interface UseDropdownMenuOptions {
  onToggle?: (isOpen: boolean) => void
}

export function useDropdownMenu({ onToggle }: UseDropdownMenuOptions = {}) {
  const [isOpen, setIsOpen] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const buttonId = useId()
  const panelId = useId()
  const onToggleRef = useRef(onToggle)

  useEffect(() => {
    onToggleRef.current = onToggle
  }, [onToggle])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        isOpen &&
        panelRef.current &&
        buttonRef.current &&
        !panelRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
        onToggleRef.current?.(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
  }, [isOpen])

  useEffect(() => {
    function handleEscape(event: globalThis.KeyboardEvent) {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false)
        onToggleRef.current?.(false)
        buttonRef.current?.focus()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      return () => {
        document.removeEventListener('keydown', handleEscape)
      }
    }
  }, [isOpen])

  useEffect(() => {
    function handleFocusOut(event: FocusEvent) {
      if (
        isOpen &&
        panelRef.current &&
        buttonRef.current &&
        !panelRef.current.contains(event.relatedTarget as Node) &&
        !buttonRef.current.contains(event.relatedTarget as Node)
      ) {
        setIsOpen(false)
        onToggleRef.current?.(false)
      }
    }

    if (isOpen) {
      const panel = panelRef.current
      const button = buttonRef.current

      if (panel && button) {
        panel.addEventListener('focusout', handleFocusOut)
        button.addEventListener('focusout', handleFocusOut)

        return () => {
          panel.removeEventListener('focusout', handleFocusOut)
          button.removeEventListener('focusout', handleFocusOut)
        }
      }
    }
  }, [isOpen])

  const closeMenu = () => {
    setIsOpen(false)
    onToggleRef.current?.(false)
  }

  const toggleMenu = () => {
    const willOpen = !isOpen
    setIsOpen(willOpen)
    onToggleRef.current?.(willOpen)
  }

  return {
    isOpen,
    closeMenu,
    toggleMenu,
    buttonRef: buttonRef as DropdownMenuButtonRef,
    panelRef,
    buttonId,
    panelId,
  }
}
