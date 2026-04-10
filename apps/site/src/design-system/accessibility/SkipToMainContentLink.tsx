'use client'

import Trans from '@/components/translation/trans/TransClient'
import type { SkipLinksDisplayed } from '@/types'
import { useRef } from 'react'
import ButtonLink from '../buttons/ButtonLink'

interface Props {
  skipLinksDisplayed?: SkipLinksDisplayed
}

export default function SkipToMainContentLink({
  skipLinksDisplayed = new Set(['main', 'navigation', 'footer']),
}: Props) {
  const navRef = useRef<HTMLElement>(null)

  return (
    <div className="skip-to-main-content sr-only flex !w-full items-center focus-within:not-sr-only! focus-within:top-0 focus-within:right-auto focus-within:left-0 focus-within:z-[100000] focus-within:h-auto! focus-within:p-2!">
      <nav
        ref={navRef}
        role="navigation"
        id="skip-to-main-content"
        tabIndex={-1}
        aria-labelledby="skip-nav-title"
        className="flex w-full flex-col items-start gap-2 md:flex-row md:items-center">
        <p id="skip-nav-title" className="sr-only">
          <Trans>Accès rapide</Trans>
        </p>
        {skipLinksDisplayed.has('main') && (
          <ButtonLink
            color="secondary"
            href="#main-content"
            className="focus:ring-primary-700 focus:w-auto focus:ring-2 focus:ring-offset-3 focus:outline-hidden">
            <Trans>Contenu</Trans>
          </ButtonLink>
        )}

        {skipLinksDisplayed.has('navigation') && (
          <>
            <ButtonLink
              color="secondary"
              href="#header-navigation-desktop"
              className="focus:ring-primary-700 hidden focus:w-auto focus:ring-2 focus:ring-offset-[2px] md:flex">
              <Trans>Menu</Trans>
            </ButtonLink>

            <ButtonLink
              color="secondary"
              href="#header-navigation-mobile"
              className="focus:ring-primary-700 focus:w-auto focus:ring-2 focus:ring-offset-[2px] md:hidden">
              <Trans>Menu</Trans>
            </ButtonLink>
          </>
        )}

        {skipLinksDisplayed.has('footer') && (
          <ButtonLink
            color="secondary"
            href="#footer"
            className="focus:ring-primary-700 focus:w-auto focus:ring-2 focus:ring-offset-3 focus:outline-hidden">
            <Trans>Pied de page</Trans>
          </ButtonLink>
        )}
      </nav>
    </div>
  )
}
