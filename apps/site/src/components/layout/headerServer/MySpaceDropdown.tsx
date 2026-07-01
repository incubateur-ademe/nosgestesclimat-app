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
import { truncateMiddle } from '@/helpers/formatters/truncateMiddle'
import { resetLocalState } from '@/helpers/user/resetLocalState'
import { useDropdown } from '@/hooks/navigation/useDropdown'
import { useMenuKeyboardNavigation } from '@/hooks/navigation/useMenuKeyboardNavigation'
import { useClientTranslation } from '@/hooks/useClientTranslation'
import { useInputMethod } from '@/hooks/useInputMethod'
import { useUser } from '@/publicodes-state'
import {
  trackMatomoEvent__deprecated,
  trackPosthogEvent,
} from '@/utils/analytics/trackEvent'
import Link from 'next/link'
import posthog from 'posthog-js'
import { type KeyboardEvent, useEffect, useRef } from 'react'
import { twMerge } from 'tailwind-merge'

const MAX_EMAIL_LENGTH = 20
const MENU_ITEM_COUNT = 2

interface Props {
  email: string
  onLogout: () => void
}

export default function MySpaceDropdown({ email, onLogout }: Props) {
  const { t } = useClientTranslation()

  const { isOpen, close, toggle, open, buttonRef, menuRef, buttonId, menuId } =
    useDropdown()

  const { isKeyboardNavigation, setKeyboardInputMethod } = useInputMethod()

  const { handleMenuKeyDown, setItemRef, focusFirstItem } =
    useMenuKeyboardNavigation({
      itemCount: MENU_ITEM_COUNT,
      onEscape: close,
    })

  const { setUser, updateSimulations } = useUser()

  const displayEmail = truncateMiddle(email, MAX_EMAIL_LENGTH)

  // Local safety ref to distinguish keyboard vs mouse opening of the menu
  // even if the global input method listeners haven't settled yet.
  const openedWithKeyboardRef = useRef(false)

  // Focus the first item when the menu is opened with a keyboard interaction
  useEffect(() => {
    if (isOpen && isKeyboardNavigation) {
      requestAnimationFrame(() => {
        focusFirstItem()
      })
    }
  }, [isOpen, isKeyboardNavigation, focusFirstItem])

  const handleToggleMenu = () => {
    trackMatomoEvent__deprecated(headerClickMonEspaceAuthenticatedServer)
    trackPosthogEvent(captureClickHeaderMonEspaceAuthenticatedServer)

    const isOpening = !isOpen

    // When opening with a mouse click, ensure keyboard navigation is disabled
    if (isOpening && !openedWithKeyboardRef.current) {
      setKeyboardInputMethod(false)
    }

    // Reset the ref for the next interaction
    if (isOpening) {
      openedWithKeyboardRef.current = false
    }

    toggle()
  }

  const handleButtonKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      openedWithKeyboardRef.current = true
      setKeyboardInputMethod(true)
      handleToggleMenu()
    } else if (event.key === 'ArrowDown' && !isOpen) {
      event.preventDefault()
      openedWithKeyboardRef.current = true
      setKeyboardInputMethod(true)
      open()
    }
  }

  const handleLogout = () => {
    trackMatomoEvent__deprecated(headerClickLogoutAuthenticatedServer)
    trackPosthogEvent(captureClickHeaderLogoutAuthenticatedServer)
    close()

    resetLocalState({ setUser, updateSimulations })

    posthog.reset()

    onLogout()
  }

  const handleAccessMySpace = () => {
    close()
    trackMatomoEvent__deprecated(headerClickAccessMySpaceAuthenticatedServer)
    trackPosthogEvent(captureClickHeaderAccessMySpaceAuthenticatedServer)
  }

  const ariaLabelTitle = isOpen
    ? t(
        'header.monEspace.openMenuButton.close.title',
        'Mon espace ({{email}}), fermer le menu',
        {
          email,
        }
      )
    : t(
        'header.monEspace.openMenuButton.open.title',
        'Mon espace ({{email}}), ouvrir le menu',
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
                ref={setItemRef(0)}
                href={MON_ESPACE_PATH}
                role="menuitem"
                className={twMerge(
                  'text-default hover:bg-primary-100 block min-h-10 px-4 py-2 text-sm no-underline! transition-colors focus:outline-none',
                  isKeyboardNavigation
                    ? 'focus:bg-primary-50 focus:ring-primary-700 focus:underline! focus:ring-2 focus:ring-offset-2'
                    : 'focus:bg-primary-50 hover:bg-primary-50 focus:ring-color-transparent! hover:underline! focus:underline! focus:ring-0! focus:ring-offset-0!'
                )}
                onClick={handleAccessMySpace}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    handleAccessMySpace()
                  }
                }}>
                <Trans i18nKey="header.monEspace.access">
                  Accéder à mon espace
                </Trans>
              </Link>
            </li>
            <li>
              <button
                ref={setItemRef(1)}
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
