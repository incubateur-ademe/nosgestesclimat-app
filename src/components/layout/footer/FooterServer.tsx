import Ademe from '@/components/images/partners/Ademe'
import Marianne from '@/components/images/partners/Marianne'
import ThematicPagesSection from '@/components/layout/ThematicPagesSection'
import Link from '@/components/Link'
import Logo from '@/components/misc/Logo'
import LanguageSwitchButton from '@/components/translation/LanguageSwitchButton'
import Trans from '@/components/translation/trans/TransServer'

import InlineLink from '@/design-system/inputs/InlineLink'
import { getServerTranslation } from '@/helpers/getServerTranslation'
import type { Locale } from '@/i18nConfig'
import { cacheLife } from 'next/cache'
import { twMerge } from 'tailwind-merge'
import HideInIframe from '../HideInIframe'
import CookieButton from './CookieButton'
import WantToActBlock from './WantToActBlock'

interface Props {
  backgroundColor?: 'default' | 'white'
  locale: Locale
  className?: string
  params?: Record<string, string>
}

export default async function FooterServer({
  backgroundColor = 'default',
  locale,
  className = '',
  params,
}: Props) {
  'use cache'
  cacheLife('days')

  const { t } = await getServerTranslation({ locale })

  return (
    <footer
      id="footer"
      data-track
      tabIndex={-1}
      role="contentinfo"
      className={twMerge(
        'relative bg-gray-100 p-4 pb-32! sm:p-8',
        className,
        backgroundColor === 'white' ? 'bg-white' : ''
      )}>
      <div className="md:mx-auto md:max-w-5xl">
        <div className="mb-8 flex items-center justify-between">
          <Link
            href="/"
            data-testid="home-logo-link"
            className="flex items-center justify-center no-underline">
            <Logo size="md" />
          </Link>
        </div>
        {locale === 'fr' ? (
          <div className="my-4 block md:hidden">
            <WantToActBlock locale={locale} />
          </div>
        ) : null}

        <div className="flex flex-col md:flex-row">
          <div className="mb-10 flex flex-col flex-wrap justify-start gap-x-16 gap-y-8 pt-4 md:flex-row">
            <div className="flex flex-col gap-y-2">
              <p
                id="about-section"
                className="text-default mb-0 text-sm font-bold">
                <Trans locale={locale}>À propos</Trans>
              </p>
              <ul aria-labelledby="about-section">
                <li>
                  <InlineLink
                    href="https://beta.gouv.fr/startups/nosgestesclimat.html"
                    target="_blank"
                    aria-label={t('Qui sommes-nous - Nouvelle fenêtre')}
                    rel="noopener noreferrer"
                    className="text-default text-sm no-underline hover:underline">
                    <Trans locale={locale}>Qui sommes-nous</Trans>
                  </InlineLink>
                </li>
                <li>
                  <InlineLink
                    href="/plan-du-site"
                    className="text-default text-sm no-underline hover:underline">
                    <Trans locale={locale}>Plan du site</Trans>
                  </InlineLink>
                </li>
                <li>
                  <InlineLink
                    href="/contact"
                    className="text-default text-sm no-underline hover:underline">
                    <Trans locale={locale}>Contact</Trans>
                  </InlineLink>
                </li>
                <li>
                  <InlineLink
                    href="/international"
                    className="text-default text-sm no-underline hover:underline">
                    <Trans locale={locale}>International</Trans>
                  </InlineLink>
                </li>
                <li>
                  <InlineLink
                    href="/stats"
                    className="text-default text-sm no-underline hover:underline">
                    <Trans locale={locale}>Statistiques</Trans>
                  </InlineLink>
                </li>
              </ul>
            </div>

            <div className="flex flex-col gap-y-2">
              <p
                id="diffusion-section"
                className="text-default mb-0 text-sm font-bold">
                <Trans locale={locale}>Diffusion</Trans>
              </p>
              <ul aria-labelledby="diffusion-section">
                <li>
                  <InlineLink
                    href="/diffuser"
                    className="text-default text-sm no-underline hover:underline">
                    <Trans locale={locale}>Diffuser Nos Gestes Climat</Trans>
                  </InlineLink>
                </li>
                <li>
                  <InlineLink
                    href="/organisations"
                    data-testid="organisations-link"
                    className="text-default text-sm no-underline hover:underline">
                    <Trans locale={locale}>Organisations</Trans>
                  </InlineLink>
                </li>
                <li>
                  <InlineLink
                    href="/nos-relais"
                    className="text-default text-sm no-underline hover:underline">
                    <Trans locale={locale}>Relais et partenaires</Trans>
                  </InlineLink>
                </li>
              </ul>
            </div>

            <div className="flex flex-col gap-y-2">
              <p
                id="resources-section"
                className="text-default mb-0 text-sm font-bold">
                <Trans locale={locale}>Ressources</Trans>
              </p>
              <ul aria-labelledby="resources-section">
                <li>
                  <InlineLink
                    href="/blog"
                    className="text-default text-sm no-underline hover:underline">
                    <Trans locale={locale}>Blog</Trans>
                  </InlineLink>
                </li>
                <li>
                  <InlineLink
                    href="/documentation"
                    className="text-default text-sm no-underline hover:underline">
                    <Trans locale={locale}>Documentation</Trans>
                  </InlineLink>
                </li>
                <li>
                  <InlineLink
                    href="/questions-frequentes"
                    className="text-default text-sm no-underline hover:underline">
                    <Trans locale={locale}>FAQ</Trans>
                  </InlineLink>
                </li>
                <li>
                  <InlineLink
                    href="/nouveautes"
                    className="text-default text-sm no-underline hover:underline">
                    <Trans locale={locale}>Nouveautés</Trans>
                  </InlineLink>
                </li>
                <li>
                  <InlineLink
                    href="https://impactco2.fr"
                    target="_blank"
                    className="text-default text-sm no-underline hover:underline">
                    Impact CO2
                  </InlineLink>
                </li>
              </ul>
            </div>
            <div className="flex flex-col gap-y-2">
              <ThematicPagesSection locale={locale} />
            </div>
          </div>
          {locale === 'fr' ? (
            <div className="hidden md:block">
              <HideInIframe hideIfNotFrenchRegion>
                <WantToActBlock locale={locale} />
              </HideInIframe>
            </div>
          ) : null}
        </div>
        <LanguageSwitchButton params={params} />

        <div className="flex flex-wrap justify-between gap-8 md:flex-row md:flex-nowrap">
          <div>
            <div className="mt-4 text-xs">
              <ul>
                <li className="block md:inline">
                  <InlineLink href="/accessibilite">
                    <Trans locale={locale}>
                      Accessibilité : partiellement conforme
                    </Trans>
                  </InlineLink>
                  <span aria-hidden="true" className="mx-1 hidden sm:inline">
                    |
                  </span>
                </li>
                <li className="block md:inline">
                  <InlineLink href="/mentions-legales">
                    <Trans locale={locale}>Mentions légales</Trans>
                  </InlineLink>
                  <span aria-hidden="true" className="mx-1 hidden sm:inline">
                    |
                  </span>
                </li>
                <li className="block md:inline">
                  <InlineLink href="/politique-de-confidentialite">
                    <Trans locale={locale}>Politique de confidentialité</Trans>
                  </InlineLink>
                  <span aria-hidden="true" className="mx-1 hidden sm:inline">
                    |
                  </span>
                </li>
                <li className="block md:inline">
                  <CookieButton />
                </li>
              </ul>
            </div>
          </div>

          <div className="flex gap-4 self-end pb-1">
            <Marianne className="h-auto w-12 md:w-auto" />

            <Link href="https://ademe.fr" target="_blank">
              <Ademe className="h-auto w-10 md:w-auto" />
            </Link>
          </div>
        </div>
      </div>
      <div id="modal" />
    </footer>
  )
}
