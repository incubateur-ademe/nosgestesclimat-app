'use client'

import Link from '@/components/Link'
import Trans from '@/components/translation/trans/TransClient'
import { breadcrumbClickLink } from '@/constants/tracking/layout'
import { useClientTranslation } from '@/hooks/useClientTranslation'
import { trackMatomoEvent__deprecated } from '@/utils/analytics/trackEvent'
import { Fragment, type ReactNode } from 'react'
import { twMerge } from 'tailwind-merge'

export default function Breadcrumbs({
  items,
  className,
  linkClassName,
}: {
  items: {
    href: string
    label: string | ReactNode
    isActive?: boolean
    isDisabled?: boolean
  }[]
  className?: string
  linkClassName?: string
}) {
  const { t } = useClientTranslation()

  const itemBeforeCurrent = items.at(-2)

  return (
    <section
      className={twMerge('flex h-[75px] w-full items-center', className)}>
      <nav
        role="navigation"
        id="breadcrumbs-navigation"
        aria-label={t('Chemin de navigation')}
        aria-labelledby="breadcrumbs-title"
        className="w-full">
        <p id="breadcrumbs-title" className="sr-only">
          <Trans>Chemin de navigation</Trans>
        </p>
        {/* Mobile version */}
        <div className="mr-2 inline-flex items-center gap-2 last:mr-0 md:hidden">
          <svg
            className="h-5 w-5 rotate-[90deg] text-gray-700"
            fill="currentColor"
            viewBox="0 0 20 20"
            aria-hidden="true">
            <path
              clipRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              fillRule="evenodd"
            />
          </svg>

          {itemBeforeCurrent && (
            <Link
              onClick={(e) => {
                if (itemBeforeCurrent.isDisabled) {
                  e.preventDefault()
                }
                trackMatomoEvent__deprecated(
                  breadcrumbClickLink(itemBeforeCurrent.href)
                )
              }}
              title={`${itemBeforeCurrent.label} - ${t('Visiter cette page')}`}
              aria-current={itemBeforeCurrent.isActive}
              className={twMerge(
                'text-default hover:text-primary-700 max-w-full text-sm text-ellipsis whitespace-nowrap capitalize hover:underline',
                linkClassName
              )}
              href={itemBeforeCurrent.href}>
              <span className="whitespace-break-spaces">
                {itemBeforeCurrent.label}
              </span>
            </Link>
          )}
        </div>
        {/* Desktop version */}
        <ul className="mx-auto hidden h-full w-full flex-wrap items-center md:flex">
          {items.map(({ href, label, isActive, isDisabled }, index) => (
            <Fragment key={`breadcrumb-item-${index}`}>
              <li className="mr-2 inline-flex items-center gap-2 last:mr-0">
                <Link
                  onClick={(e) => {
                    if (isDisabled || isActive) {
                      e.preventDefault()
                    }
                    trackMatomoEvent__deprecated(breadcrumbClickLink(href))
                  }}
                  title={`${label} - ${isActive ? t('Page active') : t('Visiter cette page')}`}
                  aria-current={isActive}
                  className={twMerge(
                    'text-default hover:text-primary-700 max-w-full text-sm text-ellipsis whitespace-nowrap capitalize hover:underline',
                    isActive
                      ? 'text-primary-700 hover:text-primary-700 cursor-default font-bold no-underline hover:no-underline'
                      : '',
                    isDisabled ? 'cursor-default' : '',
                    linkClassName
                  )}
                  href={href}>
                  <span className="whitespace-break-spaces">{label}</span>
                </Link>
                {index < items.length - 1 && (
                  <svg
                    className="h-5 w-5 rotate-[-90deg] text-gray-700"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    aria-hidden="true">
                    <path
                      clipRule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      fillRule="evenodd"
                    />
                  </svg>
                )}
              </li>
            </Fragment>
          ))}
        </ul>
      </nav>
    </section>
  )
}
