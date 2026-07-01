'use client'

import ChevronRight from '@/components/icons/ChevronRight'
import LogOutIcon from '@/components/icons/LogOutIcon'
import Trans from '@/components/translation/trans/TransClient'
import {
  captureClickHeaderAccessMySpaceAuthenticatedServer,
  captureClickHeaderActionsAuthenticatedServer,
  captureClickHeaderActionsUnuthenticatedServer,
  captureClickHeaderCollectiveTestsAuthenticatedServer,
  captureClickHeaderCollectiveTestsUnuthenticatedServer,
  captureClickHeaderLogoutAuthenticatedServer,
  captureClickHeaderMonEspaceAuthenticatedServer,
} from '@/constants/tracking/posthogTrackers'
import {
  headerClickAccessMySpaceAuthenticatedServer,
  headerClickActionsAuthenticatedServer,
  headerClickActionsUnauthenticatedServer,
  headerClickCollectiveAuthenticatedServer,
  headerClickCollectiveUnauthenticatedServer,
  headerClickLogoutAuthenticatedServer,
  headerClickMonEspaceAuthenticatedServer,
} from '@/constants/tracking/user-account'
import {
  ACTIONS_PATH,
  MON_ESPACE_GROUPS_PATH,
  MON_ESPACE_PATH,
  ORGANISATION_HOME_PAGE,
  SIMULATOR_PATH,
} from '@/constants/urls/paths'
import Button from '@/design-system/buttons/Button'
import { truncateMiddle } from '@/helpers/formatters/truncateMiddle'
import type { AuthUser } from '@/helpers/server/model/user'
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

interface Props {
  user?: AuthUser
  onLogout: () => void
}

export default function MySpaceDropdown({ user, onLogout }: Props) {
  const { t } = useClientTranslation()

  const { isOpen, close, toggle, open, buttonRef, menuRef, buttonId, menuId } =
    useDropdown()

  const { isKeyboardNavigation, setKeyboardInputMethod } = useInputMethod()

  const MENU_ITEM_COUNT = user ? 4 : 3

  const { handleMenuKeyDown, setItemRef, focusFirstItem } =
    useMenuKeyboardNavigation({
      itemCount: MENU_ITEM_COUNT,
      onEscape: close,
    })

  const { setUser, updateSimulations } = useUser()

  const displayEmail = user
    ? truncateMiddle(user.email, MAX_EMAIL_LENGTH)
    : undefined

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
  const handleAccessActions = () => {
    close()
    trackMatomoEvent__deprecated(
      user
        ? headerClickActionsAuthenticatedServer
        : headerClickActionsUnauthenticatedServer
    )
    trackPosthogEvent(
      user
        ? captureClickHeaderActionsAuthenticatedServer
        : captureClickHeaderActionsUnuthenticatedServer
    )
  }
  const handleAccessCollectiveTests = () => {
    close()
    trackMatomoEvent__deprecated(
      user
        ? headerClickCollectiveAuthenticatedServer
        : headerClickCollectiveUnauthenticatedServer
    )
    trackPosthogEvent(
      user
        ? captureClickHeaderCollectiveTestsAuthenticatedServer
        : captureClickHeaderCollectiveTestsUnuthenticatedServer
    )
  }

  const ariaLabelTitle = isOpen
    ? user
      ? t(
          'header.monEspace.openMenuButton.close.title',
          'Mon espace ({{email}}), fermer le menu',
          {
            email: user.email,
          }
        )
      : t(
          'header.monEspace.openMenuButtonUnauthenticated.close.title',
          'Mon espace, fermer le menu'
        )
    : user
      ? t(
          'header.monEspace.openMenuButton.open.title',
          'Mon espace ({{email}}), ouvrir le menu',
          {
            email: user.email,
          }
        )
      : t(
          'header.monEspace.openMenuButtonUnauthenticated.open.title',
          'Mon espace, ouvrir le menu'
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
        {user ? <span className="hidden md:inline">({displayEmail})</span> : ''}
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
          className="absolute top-full right-0 z-50 mt-2 min-w-50 rounded-lg border border-gray-200 bg-white shadow-lg"
          onKeyDown={handleMenuKeyDown}
          tabIndex={-1}>
          <ul>
            <li>
              <Link
                ref={setItemRef(0)}
                href={user ? MON_ESPACE_PATH : SIMULATOR_PATH}
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
                <Trans i18nKey="header.monEspace.myResults">
                  Mes résultats
                </Trans>
              </Link>
            </li>
            {user && (
              <li>
                <Link
                  ref={setItemRef(1)}
                  href={ACTIONS_PATH}
                  role="menuitem"
                  className={twMerge(
                    'text-default hover:bg-primary-100 block min-h-10 px-4 py-2 text-sm no-underline! transition-colors focus:outline-none',
                    isKeyboardNavigation
                      ? 'focus:bg-primary-50 focus:ring-primary-700 focus:underline! focus:ring-2 focus:ring-offset-2'
                      : 'focus:bg-primary-50 hover:bg-primary-50 focus:ring-color-transparent! hover:underline! focus:underline! focus:ring-0! focus:ring-offset-0!'
                  )}
                  onClick={handleAccessActions}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      handleAccessActions()
                    }
                  }}>
                  <Trans i18nKey="header.monEspace.actions">Mes actions</Trans>
                </Link>
              </li>
            )}

            <li>
              <Link
                ref={setItemRef(user ? 2 : 1)}
                href={user ? MON_ESPACE_GROUPS_PATH : ORGANISATION_HOME_PAGE}
                role="menuitem"
                className={twMerge(
                  'text-default hover:bg-primary-100 block min-h-10 px-4 py-2 text-sm no-underline! transition-colors focus:outline-none',
                  isKeyboardNavigation
                    ? 'focus:bg-primary-50 focus:ring-primary-700 focus:underline! focus:ring-2 focus:ring-offset-2'
                    : 'focus:bg-primary-50 hover:bg-primary-50 focus:ring-color-transparent! hover:underline! focus:underline! focus:ring-0! focus:ring-offset-0!'
                )}
                onClick={handleAccessCollectiveTests}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    handleAccessCollectiveTests()
                  }
                }}>
                <Trans i18nKey="header.monEspace.collective">
                  Mes tests collectifs
                </Trans>
              </Link>
            </li>

            <li>
              <button
                ref={setItemRef(user ? 3 : 2)}
                type="button"
                role="menuitem"
                className="text-default hover:bg-primary-50 flex min-h-10 w-full items-center gap-2 px-4 py-2 text-sm transition-colors hover:underline! focus:underline!"
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
