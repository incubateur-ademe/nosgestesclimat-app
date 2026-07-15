'use client'

import type { ReactNode } from 'react'
import { twMerge } from 'tailwind-merge'
import { useDropdownMenu } from './useDropdownMenu'

interface DropdownMenuTriggerProps {
  isOpen: boolean
  buttonRef: ReturnType<typeof useDropdownMenu>['buttonRef']
  buttonId: string
  menuId: string
  onToggle: () => void
  onKeyDown: ReturnType<typeof useDropdownMenu>['handleButtonKeyDown']
}

interface Props {
  trigger: (props: DropdownMenuTriggerProps) => ReactNode
  children: (props: {
    isKeyboardNavigation: boolean
    closeMenu: () => void
    getItemClassName: (options: DropdownMenuItemClassNameProps) => string
  }) => ReactNode
  menuClassName?: string
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
  menuClassName,
  align = 'right',
  onToggle,
}: Props) {
  const {
    isOpen,
    isKeyboardNavigation,
    closeMenu,
    toggleMenu,
    buttonRef,
    menuRef,
    buttonId,
    menuId,
    handleButtonKeyDown,
    handleMenuKeyDown,
  } = useDropdownMenu({ onToggle })

  const getItemClassName = (options: DropdownMenuItemClassNameProps) =>
    getDropdownMenuItemClassName({ ...options, isKeyboardNavigation })

  return (
    <div className="relative inline-block">
      {trigger({
        isOpen,
        buttonRef,
        buttonId,
        menuId,
        onToggle: toggleMenu,
        onKeyDown: handleButtonKeyDown,
      })}

      {isOpen && (
        <div
          ref={menuRef}
          id={menuId}
          role="menu"
          aria-labelledby={buttonId}
          className={twMerge(
            'absolute top-full z-50 mt-2 min-w-[8.75rem] overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg',
            align === 'right' ? 'right-0' : 'left-0',
            menuClassName
          )}
          onKeyDown={handleMenuKeyDown}
          tabIndex={-1}>
          <ul className="m-0 list-none p-0">
            {children({ isKeyboardNavigation, closeMenu, getItemClassName })}
          </ul>
        </div>
      )}
    </div>
  )
}

export { useDropdownMenu }

const positionClassNames: Record<DropdownMenuItemPosition, string> = {
  only: 'rounded-lg',
  first: 'rounded-t-lg',
  middle: 'rounded-none',
  last: 'rounded-b-lg',
}

export interface DropdownMenuItemClassNameProps {
  isActive?: boolean
  isKeyboardNavigation?: boolean
  position?: DropdownMenuItemPosition
  className?: string
}

export function getDropdownMenuItemClassName({
  isActive = false,
  isKeyboardNavigation = false,
  position = 'only',
  className,
}: DropdownMenuItemClassNameProps) {
  return twMerge(
    'dropdown-menu-item flex w-full items-center gap-2 px-4 py-3 text-center text-sm font-bold no-underline transition-colors',
    positionClassNames[position],
    isActive
      ? 'bg-primary-700 hover:bg-primary-700 text-white hover:text-white'
      : 'bg-white text-primary-700 hover:bg-primary-100 hover:text-primary-700',
    // Only show the keyboard focus indicator during keyboard navigation
    isKeyboardNavigation && 'dropdown-menu-item--focusable',
    className
  )
}
