'use client'

import ChevronRight from '@/components/icons/ChevronRight'
import LogOutIcon from '@/components/icons/LogOutIcon'
import Trans from '@/components/translation/trans/TransClient'
import {
  captureClickHeaderAccessMySpaceAuthenticatedServer,
  captureClickHeaderLogoutAuthenticatedServer,
  captureClickHeaderMonEspaceAuthenticatedServer,
} from '@/constants/tracking/posthogTrackers'
import {
  headerClickAccessMySpaceAuthenticatedServer,
  headerClickLogoutAuthenticatedServer,
  headerClickMonEspaceAuthenticatedServer,
} from '@/constants/tracking/user-account'
import { MON_ESPACE_PATH } from '@/constants/urls/paths'
import Button from '@/design-system/buttons/Button'
import { resetLocalState } from '@/helpers/user/resetLocalState'
import { useClientTranslation } from '@/hooks/useClientTranslation'
import { useUser } from '@/publicodes-state'
import {
  trackMatomoEvent__deprecated,
  trackPosthogEvent,
} from '@/utils/analytics/trackEvent'
import Link from 'next/link'
import posthog from 'posthog-js'
import { type KeyboardEvent, useEffect, useId, useRef, useState } from 'react'
import { twMerge } from 'tailwind-merge'

const MAX_EMAIL_LENGTH = 20

interface Props {
  email: string
  onLogout: () => void
}

export default function MySpaceDropdown({ email, onLogout }: Props) {
  const { t } = useClientTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const [isKeyboardNavigation, setIsKeyboardNavigation] = useState(false)
  const openedWithKeyboardRef = useRef(false)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const firstMenuItemRef = useRef<HTMLAnchorElement>(null)
  const logoutButtonRef = useRef<HTMLButtonElement>(null)
  const buttonId = useId()
  const menuId = useId()

  const { setUser, updateSimulations } = useUser()

  const displayEmail =
    email.length > MAX_EMAIL_LENGTH
      ? `${email.substring(0, MAX_EMAIL_LENGTH)}…`
      : email

  // Track keyboard vs mouse navigation
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

  // Close the menu when clicking outside
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
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
  }, [isOpen])

  // Close the menu with the Escape key
  useEffect(() => {
    function handleEscape(event: globalThis.KeyboardEvent) {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false)
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

  // Focus the first item in the menu when the menu is opened with keyboard
  useEffect(() => {
    if (isOpen && isKeyboardNavigation) {
      requestAnimationFrame(() => {
        firstMenuItemRef.current?.focus()
      })
    }
  }, [isOpen, isKeyboardNavigation])

  // Close the menu on blur
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
  }, [isOpen])

  const handleToggleMenu = () => {
    trackMatomoEvent__deprecated(headerClickMonEspaceAuthenticatedServer)
    trackPosthogEvent(captureClickHeaderMonEspaceAuthenticatedServer)
    setIsOpen((prev) => {
      const willOpen = !prev
      // If opening with mouse click, reset keyboard navigation flag
      if (willOpen && !openedWithKeyboardRef.current) {
        setIsKeyboardNavigation(false)
      }
      // Reset the flag after checking
      if (willOpen) {
        openedWithKeyboardRef.current = false
      }
      return willOpen
    })
  }

  const handleButtonKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      openedWithKeyboardRef.current = true
      setIsKeyboardNavigation(true)
      handleToggleMenu()
    } else if (event.key === 'ArrowDown' && !isOpen) {
      event.preventDefault()
      openedWithKeyboardRef.current = true
      setIsKeyboardNavigation(true)
      setIsOpen(true)
    }
  }

  const handleMenuKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault()
      setIsOpen(false)
      buttonRef.current?.focus()
    } else if (event.key === 'ArrowDown') {
      event.preventDefault()
      if (document.activeElement === firstMenuItemRef.current) {
        logoutButtonRef.current?.focus()
      } else {
        firstMenuItemRef.current?.focus()
      }
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      if (document.activeElement === logoutButtonRef.current) {
        firstMenuItemRef.current?.focus()
      } else {
        logoutButtonRef.current?.focus()
      }
    }
  }

  const handleLogout = async () => {
    trackMatomoEvent__deprecated(headerClickLogoutAuthenticatedServer)
    trackPosthogEvent(captureClickHeaderLogoutAuthenticatedServer)
    setIsOpen(false)

    await resetLocalState({ setUser, updateSimulations })

    posthog.reset()

    onLogout()
  }

  const ariaLabelTitle = isOpen
    ? t(
        'header.monEspace.openMenuButton.open.title',
        'Mon espace ({{email}}), ouvrir le menu',
        {
          email,
        }
      )
    : t(
        'header.monEspace.openMenuButton.close.title',
        'Mon espace ({{email}}), fermer le menu',
        {
          email,
        }
      )

  return (
    <div className="relative inline-block">
      <Button
        ref={buttonRef}
        id={buttonId}
        size="sm"
        color="secondary"
        className="inline-flex gap-1 align-baseline"
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-controls={menuId}
        aria-label={ariaLabelTitle}
        title={ariaLabelTitle}
        onClick={handleToggleMenu}
        onKeyDown={handleButtonKeyDown}>
        <Trans i18nKey="header.monEspace.title">Mon espace</Trans>{' '}
        <span className="hidden md:inline">({displayEmail})</span>
        <ChevronRight
          className={twMerge(
            'ml-3 inline-block w-2 transition-transform',
            isOpen ? 'rotate-[-90deg]' : 'rotate-90'
          )}
        />
      </Button>

      {isOpen && (
        <div
          ref={menuRef}
          id={menuId}
          role="menu"
          aria-labelledby={buttonId}
          className="absolute top-full right-0 z-50 mt-2 min-w-[200px] rounded-lg border border-gray-200 bg-white shadow-lg"
          onKeyDown={handleMenuKeyDown}
          tabIndex={-1}>
          <ul>
            <li>
              <Link
                ref={firstMenuItemRef}
                href={MON_ESPACE_PATH}
                role="menuitem"
                className={twMerge(
                  'text-default hover:bg-primary-100 block min-h-10 px-4 py-2 text-sm no-underline! transition-colors focus:outline-none',
                  isKeyboardNavigation
                    ? 'focus:bg-primary-50 focus:ring-primary-700 focus:underline! focus:ring-2 focus:ring-offset-2'
                    : 'focus:bg-primary-50 hover:bg-primary-50 focus:ring-color-transparent! hover:underline! focus:underline! focus:ring-0! focus:ring-offset-0!'
                )}
                onClick={() => {
                  setIsOpen(false)
                  trackMatomoEvent__deprecated(
                    headerClickAccessMySpaceAuthenticatedServer
                  )
                  trackPosthogEvent(
                    captureClickHeaderAccessMySpaceAuthenticatedServer
                  )
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    setIsOpen(false)
                    trackMatomoEvent__deprecated(
                      headerClickAccessMySpaceAuthenticatedServer
                    )
                    trackPosthogEvent(
                      captureClickHeaderAccessMySpaceAuthenticatedServer
                    )
                  }
                }}>
                <Trans i18nKey="header.monEspace.access">
                  Accéder à mon espace
                </Trans>
              </Link>
            </li>
            <li>
              <button
                ref={logoutButtonRef}
                type="button"
                role="menuitem"
                className="text-default hover:bg-primary-50 focus:bg-primary-50 focus:ring-primary-700 flex min-h-10 w-full items-center gap-2 px-4 py-2 text-sm transition-colors hover:underline! focus:underline! focus:ring-2 focus:ring-offset-2 focus:outline-none"
                onClick={handleLogout}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    handleLogout()
                  }
                }}>
                <Trans i18nKey="header.monEspace.logout">Déconnexion</Trans>
                <LogOutIcon className="fill-default w-4" />
              </button>
            </li>
          </ul>
        </div>
      )}
    </div>
  )
}
