'use client'

import {
  type KeyboardEvent,
  type RefObject,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react'

interface UseDropdownMenuOptions {
  onToggle?: (isOpen: boolean) => void
}

export function useDropdownMenu({ onToggle }: UseDropdownMenuOptions = {}) {
  const [isOpen, setIsOpen] = useState(false)
  const [isKeyboardNavigation, setIsKeyboardNavigation] = useState(false)
  const openedWithKeyboardRef = useRef(false)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const buttonId = useId()
  const menuId = useId()

  const getMenuItems = () =>
    menuRef.current
      ? Array.from(
          menuRef.current.querySelectorAll<HTMLElement>('[role="menuitem"]')
        )
      : []

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

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        isOpen &&
        menuRef.current &&
        buttonRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
        onToggle?.(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
  }, [isOpen, onToggle])

  useEffect(() => {
    function handleEscape(event: globalThis.KeyboardEvent) {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false)
        onToggle?.(false)
        buttonRef.current?.focus()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      return () => {
        document.removeEventListener('keydown', handleEscape)
      }
    }
  }, [isOpen, onToggle])

  useEffect(() => {
    if (isOpen && isKeyboardNavigation) {
      requestAnimationFrame(() => {
        getMenuItems()[0]?.focus()
      })
    }
  }, [isOpen, isKeyboardNavigation])

  useEffect(() => {
    function handleFocusOut(event: FocusEvent) {
      if (
        isOpen &&
        menuRef.current &&
        buttonRef.current &&
        !menuRef.current.contains(event.relatedTarget as Node) &&
        !buttonRef.current.contains(event.relatedTarget as Node)
      ) {
        setIsOpen(false)
        onToggle?.(false)
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
  }, [isOpen, onToggle])

  const closeMenu = () => {
    setIsOpen(false)
    onToggle?.(false)
  }

  const openMenu = () => {
    setIsOpen(true)
    onToggle?.(true)
  }

  const toggleMenu = () => {
    setIsOpen((prev) => {
      const willOpen = !prev
      if (willOpen && !openedWithKeyboardRef.current) {
        setIsKeyboardNavigation(false)
      }
      if (willOpen) {
        openedWithKeyboardRef.current = false
      }
      onToggle?.(willOpen)
      return willOpen
    })
  }

  const handleButtonKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      openedWithKeyboardRef.current = true
      setIsKeyboardNavigation(true)
      toggleMenu()
    } else if (event.key === 'ArrowDown' && !isOpen) {
      event.preventDefault()
      openedWithKeyboardRef.current = true
      setIsKeyboardNavigation(true)
      openMenu()
    }
  }

  const handleMenuKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const menuItems = getMenuItems()
    const focusedIndex = menuItems.findIndex(
      (item) => item === document.activeElement
    )

    if (event.key === 'Escape') {
      event.preventDefault()
      closeMenu()
      buttonRef.current?.focus()
    } else if (event.key === 'ArrowDown') {
      event.preventDefault()
      setIsKeyboardNavigation(true)
      const nextIndex =
        focusedIndex >= menuItems.length - 1 ? 0 : focusedIndex + 1
      menuItems[nextIndex]?.focus()
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setIsKeyboardNavigation(true)
      const previousIndex =
        focusedIndex <= 0 ? menuItems.length - 1 : focusedIndex - 1
      menuItems[previousIndex]?.focus()
    } else if (event.key === 'Home') {
      event.preventDefault()
      setIsKeyboardNavigation(true)
      menuItems[0]?.focus()
    } else if (event.key === 'End') {
      event.preventDefault()
      setIsKeyboardNavigation(true)
      menuItems[menuItems.length - 1]?.focus()
    }
  }

  return {
    isOpen,
    isKeyboardNavigation,
    closeMenu,
    toggleMenu,
    buttonRef: buttonRef as RefObject<HTMLButtonElement | null>,
    menuRef,
    buttonId,
    menuId,
    handleButtonKeyDown,
    handleMenuKeyDown,
  }
}
