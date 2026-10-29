'use client'

import ChevronRight from '@/components/icons/ChevronRight'
import LogOutIcon from '@/components/icons/LogOutIcon'
import Trans from '@/components/translation/trans/TransClient'
import { MON_ESPACE_PATH } from '@/constants/urls/paths'
import Button from '@/design-system/buttons/Button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/design-system/shadcn/dropdown-menu'
import { logoutAndResetUserState } from '@/helpers/user/logout-and-reset-user-state'
import { useClientTranslation } from '@/hooks/useClientTranslation'
import { useUser } from '@/publicodes-state'
import { cn } from 'cn'
import Link from 'next/link'
import { useState } from 'react'

const MAX_EMAIL_LENGTH = 20

interface Props {
  email: string
}

const commonItemClassNames =
  'hover:bg-primary-50! transitions-colors active:bg-primary-200! text-sm px-4 py-2 focus-visible:ring-primary-700! focus-visible:ring-2! focus-visible:ring-offset-2!'

export default function MySpaceDropdown({ email }: Props) {
  const { t } = useClientTranslation()
  const { setUser, setSimulation } = useUser()

  const displayEmail =
    email.length > MAX_EMAIL_LENGTH
      ? `${email.substring(0, MAX_EMAIL_LENGTH)}…`
      : email

  const handleLogout = async () => {
    setIsPopoverOpen(false)

    await logoutAndResetUserState({
      setUser,
      setSimulation,
    })
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
          variant="outlined"
          className="max-tiny:px-2 max-tiny:py-2 inline-flex gap-1 align-baseline"
          data-testid="my-space-button"
          aria-label={ariaLabelTitle}
          title={ariaLabelTitle}>
          <Trans i18nKey="header.monEspace.title">Mon espace</Trans>{' '}
          <span className="hidden md:inline">({displayEmail})</span>
          <ChevronRight
            className={cn(
              'max-tiny:ml-1.5 ml-3 inline-block w-2 transition-transform',
              // Using -rotate-90 causes the rotation to freeze mid-course
              isPopoverOpen ? 'rotate-[-90deg]' : 'rotate-90'
            )}
          />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="relative z-400! w-80 bg-white">
        <DropdownMenuGroup>
          <DropdownMenuItem asChild className={commonItemClassNames}>
            <Link
              href={MON_ESPACE_PATH}
              data-testid="my-space-link"
              className="text-default size-full">
              <Trans i18nKey="header.monEspace.access">
                Accéder à mon espace
              </Trans>
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem asChild className={commonItemClassNames}>
            <button
              type="button"
              data-testid="my-space-logout-button"
              className="flex w-full items-center gap-2"
              onClick={() => void handleLogout()}>
              <Trans i18nKey="header.monEspace.logout">Déconnexion</Trans>
              <LogOutIcon className="fill-default w-4" />
            </button>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
