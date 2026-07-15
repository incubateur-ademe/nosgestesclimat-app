'use client'

import type { ReactNode } from 'react'
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

  return (
    <div className="relative inline-block">
      {trigger({
        isOpen,
        buttonRef,
        buttonId,
        panelId,
        onToggle: toggleMenu,
      })}

      {isOpen && (
        <div
          ref={panelRef}
          id={panelId}
          aria-labelledby={buttonId}
          className={twMerge(
            'absolute top-full z-50 mt-2 min-w-[8.75rem] overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg',
            align === 'right' ? 'right-0' : 'left-0',
            panelClassName
          )}>
          <ul className="m-0 list-none p-0">
            {children({ closeMenu, getItemClassName: getDropdownMenuItemClassName })}
          </ul>
        </div>
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
