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
import DropdownMenu from '@/design-system/layout/DropdownMenu'
import { resetLocalState } from '@/helpers/user/resetLocalState'
import { useClientTranslation } from '@/hooks/useClientTranslation'
import { useUser } from '@/publicodes-state'
import {
  trackMatomoEvent__deprecated,
  trackPosthogEvent,
} from '@/utils/analytics/trackEvent'
import Link from 'next/link'
import posthog from 'posthog-js'
import { twMerge } from 'tailwind-merge'

const MAX_EMAIL_LENGTH = 20

interface Props {
  email: string
  onLogout: () => void
}

export default function MySpaceDropdown({ email, onLogout }: Props) {
  const { t } = useClientTranslation()
  const { setUser, updateSimulations } = useUser()

  const displayEmail =
    email.length > MAX_EMAIL_LENGTH
      ? `${email.substring(0, MAX_EMAIL_LENGTH)}…`
      : email

  const trackToggle = () => {
    trackMatomoEvent__deprecated(headerClickMonEspaceAuthenticatedServer)
    trackPosthogEvent(captureClickHeaderMonEspaceAuthenticatedServer)
  }

  const trackAccess = () => {
    trackMatomoEvent__deprecated(headerClickAccessMySpaceAuthenticatedServer)
    trackPosthogEvent(captureClickHeaderAccessMySpaceAuthenticatedServer)
  }

  const handleLogout = (closeMenu: () => void) => {
    trackMatomoEvent__deprecated(headerClickLogoutAuthenticatedServer)
    trackPosthogEvent(captureClickHeaderLogoutAuthenticatedServer)
    closeMenu()

    resetLocalState({ setUser, updateSimulations })

    posthog.reset()

    onLogout()
  }

  return (
    <DropdownMenu
      panelClassName="min-w-[200px]"
      trigger={({ isOpen, buttonRef, buttonId, panelId, onToggle }) => {
        const ariaLabelTitle = isOpen
          ? t(
              'header.monEspace.openMenuButton.close.title',
              'Mon espace ({{email}}), fermer le menu',
              { email }
            )
          : t(
              'header.monEspace.openMenuButton.open.title',
              'Mon espace ({{email}}), ouvrir le menu',
              { email }
            )

        return (
          <Button
            ref={buttonRef}
            id={buttonId}
            size="sm"
            color="secondary"
            className="inline-flex gap-1 align-baseline"
            data-testid="my-space-button"
            aria-expanded={isOpen}
            aria-controls={panelId}
            aria-label={ariaLabelTitle}
            title={ariaLabelTitle}
            onClick={() => {
              trackToggle()
              onToggle()
            }}>
            <Trans i18nKey="header.monEspace.title">Mon espace</Trans>{' '}
            <span className="hidden md:inline">({displayEmail})</span>
            <ChevronRight
              className={twMerge(
                'ml-3 inline-block w-2 transition-transform',
                isOpen ? 'rotate-[-90deg]' : 'rotate-90'
              )}
            />
          </Button>
        )
      }}>
      {({ closeMenu }) => (
        <>
          <li>
            <Link
              href={MON_ESPACE_PATH}
              data-testid="my-space-link"
              className="text-default hover:bg-primary-100 focus-visible:bg-primary-50 block min-h-10 px-4 py-2 text-sm no-underline! transition-colors hover:underline! focus:outline-none focus-visible:underline!"
              onClick={() => {
                trackAccess()
                closeMenu()
              }}>
              <Trans i18nKey="header.monEspace.access">
                Accéder à mon espace
              </Trans>
            </Link>
          </li>
          <li>
            <button
              type="button"
              data-testid="my-space-logout-button"
              className="text-default hover:bg-primary-100 focus-visible:bg-primary-50 flex min-h-10 w-full items-center gap-2 px-4 py-2 text-sm transition-colors hover:underline! focus:outline-none focus-visible:underline!"
              onClick={() => handleLogout(closeMenu)}>
              <Trans i18nKey="header.monEspace.logout">Déconnexion</Trans>
              <LogOutIcon className="fill-default w-4" />
            </button>
          </li>
        </>
      )}
    </DropdownMenu>
  )
}
