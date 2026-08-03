'use client'

import {
  type ReactNode,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react'
import { createPortal } from 'react-dom'
import { twMerge } from 'tailwind-merge'
import { type DropdownMenuButtonRef, useDropdownMenu } from './useDropdownMenu'

export interface DropdownMenuTriggerProps {
  isOpen: boolean
  buttonRef: DropdownMenuButtonRef
  buttonId: string
  panelId: string
  onToggle: () => void
}

interface Props {
  trigger: (props: DropdownMenuTriggerProps) => ReactNode
  children: (props: {
    closeMenu: () => void
    getItemClassName: (options: DropdownMenuItemClassNameProps) => string
  }) => ReactNode
  panelClassName?: string
  align?: 'left' | 'right'
  onToggle?: (isOpen: boolean) => void
}

export type DropdownMenuItemPosition = 'only' | 'first' | 'middle' | 'last'

export function getDropdownMenuItemPosition(
  index: number,
  total: number
): DropdownMenuItemPosition {
  if (total === 1) {
    return 'only'
  }

  if (index === 0) {
    return 'first'
  }

  if (index === total - 1) {
    return 'last'
  }

  return 'middle'
}

const PANEL_OFFSET = 8

export default function DropdownMenu({
  trigger,
  children,
  panelClassName,
  align = 'right',
  onToggle,
}: Props) {
  const {
    isOpen,
    closeMenu,
    toggleMenu,
    buttonRef,
    panelRef,
    buttonId,
    panelId,
  } = useDropdownMenu({ onToggle })

  const wrapperRef = useRef<HTMLDivElement>(null)
  const [panelPosition, setPanelPosition] = useState<{
    top: number
    left?: number
    right?: number
  } | null>(null)

  const measurePanelPosition = useCallback(() => {
    const wrapper = wrapperRef.current
    if (!wrapper) return

    const rect = wrapper.getBoundingClientRect()
    const next = {
      top: rect.bottom + PANEL_OFFSET,
      ...(align === 'right'
        ? { right: window.innerWidth - rect.right }
        : { left: rect.left }),
    }

    setPanelPosition((prev) => {
      if (!prev) return next

      return prev.top === next.top &&
        prev.right === next.right &&
        prev.left === next.left
        ? prev
        : next
    })
  }, [align])

  // Position the panel when it opens. The panel is portaled to <body> with
  // fixed positioning, so it can never be clipped by an ancestor (header,
  // overflow containers...). It is measured on open and repositioned on
  // scroll/resize to stay attached to its trigger.
  useLayoutEffect(() => {
    if (isOpen) {
      measurePanelPosition()
    }
  }, [isOpen, measurePanelPosition])

  useEffect(() => {
    if (!isOpen) return

    window.addEventListener('resize', measurePanelPosition)
    window.addEventListener('scroll', measurePanelPosition, true)

    return () => {
      window.removeEventListener('resize', measurePanelPosition)
      window.removeEventListener('scroll', measurePanelPosition, true)
    }
  }, [isOpen, measurePanelPosition])

  return (
    <div ref={wrapperRef} className="relative inline-block">
      {trigger({
        isOpen,
        buttonRef,
        buttonId,
        panelId,
        onToggle: toggleMenu,
      })}

      {isOpen &&
        panelPosition &&
        createPortal(
          <div
            ref={panelRef}
            id={panelId}
            aria-labelledby={buttonId}
            style={{
              position: 'fixed',
              top: panelPosition.top,
              ...(align === 'right'
                ? { right: panelPosition.right }
                : { left: panelPosition.left }),
              zIndex: 1000,
            }}
            className={twMerge(
              'min-w-[8.75rem] overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg',
              panelClassName
            )}>
            <ul className="m-0 list-none p-0">
              {children({
                closeMenu,
                getItemClassName: getDropdownMenuItemClassName,
              })}
            </ul>
          </div>,
          document.body
        )}
    </div>
  )
}

const positionClassNames: Record<DropdownMenuItemPosition, string> = {
  only: 'rounded-lg',
  first: 'rounded-t-lg',
  middle: 'rounded-none',
  last: 'rounded-b-lg',
}

export interface DropdownMenuItemClassNameProps {
  isActive?: boolean
  position?: DropdownMenuItemPosition
  className?: string
}

export function getDropdownMenuItemClassName({
  isActive = false,
  position = 'only',
  className,
}: DropdownMenuItemClassNameProps) {
  return twMerge(
    'dropdown-menu-item flex w-full items-center gap-2 px-4 py-3 text-sm font-bold no-underline transition-colors',
    positionClassNames[position],
    isActive
      ? 'bg-primary-700 hover:bg-primary-700 text-white hover:text-white'
      : 'bg-white text-primary-700 hover:bg-primary-100 hover:text-primary-700',
    className
  )
}
