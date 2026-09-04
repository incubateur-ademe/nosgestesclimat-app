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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/design-system/shadcn/dropdown-menu'
import { resetLocalState } from '@/helpers/user/resetLocalState'
import { useClientTranslation } from '@/hooks/useClientTranslation'
import { useUser } from '@/publicodes-state'
import {
  trackMatomoEvent__deprecated,
  trackPosthogEvent,
} from '@/utils/analytics/trackEvent'
import Link from 'next/link'
import posthog from 'posthog-js'
import { useState } from 'react'
import { twMerge } from 'tailwind-merge'

const MAX_EMAIL_LENGTH = 20

interface Props {
  email: string
  onLogout: () => void
}

const commonItemClassNames =
  'hover:bg-primary-50! active:bg-primary-100! text-sm px-4 py-2'

export default function MySpaceDropdown({ email, onLogout }: Props) {
  const { t } = useClientTranslation()
  const { setUser, setSimulation } = useUser()

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

    resetLocalState({ setUser, setSimulation })

    posthog.reset()

    onLogout()
  }

  const [isPopoverOpen, setIsPopoverOpen] = useState(false)

  const ariaLabelTitle = isPopoverOpen
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
    <DropdownMenu open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          size="sm"
          color="secondary"
          className="max-tiny:px-2 max-tiny:py-2 inline-flex gap-1 align-baseline"
          data-testid="my-space-button"
          aria-label={ariaLabelTitle}
          title={ariaLabelTitle}
          onClick={() => {
            trackToggle()
          }}>
          <Trans i18nKey="header.monEspace.title">Mon espace</Trans>{' '}
          <span className="hidden md:inline">({displayEmail})</span>
          <ChevronRight
            className={twMerge(
              'max-tiny:ml-1.5 ml-3 inline-block w-2 transition-transform',
              isPopoverOpen ? 'rotate-[-90deg]' : 'rotate-90'
            )}
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="relative z-400! w-80 bg-white">
        <DropdownMenuGroup>
          <DropdownMenuItem className={commonItemClassNames}>
            <Link
              href={MON_ESPACE_PATH}
              data-testid="my-space-link"
              className="text-default"
              onClick={() => {
                trackAccess()
              }}>
              <Trans i18nKey="header.monEspace.access">
                Accéder à mon espace
              </Trans>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem className={commonItemClassNames}>
            <button
              type="button"
              data-testid="my-space-logout-button"
              className="flex w-full items-center gap-2"
              onClick={() => handleLogout(() => setIsPopoverOpen(false))}>
              <Trans i18nKey="header.monEspace.logout">Déconnexion</Trans>
              <LogOutIcon className="fill-default w-4" />
            </button>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
