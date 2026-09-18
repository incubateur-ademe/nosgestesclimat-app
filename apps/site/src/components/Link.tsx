'use client'

import BaseLink from '@/design-system/links/Link'
import { getExternalLinkProps } from '@/helpers/navigation/externalLink'
import { useClientTranslation } from '@/hooks/useClientTranslation'
import type { MouseEventHandler } from 'react'
import { twMerge } from 'tailwind-merge'

export interface LinkProps extends React.ComponentProps<typeof BaseLink> {
  href: string
  className?: string
  onClick?: MouseEventHandler<HTMLAnchorElement>
  title?: string
  target?: string
}

export default function Link({
  children,
  href,
  className,
  onClick,
  title,
  target,
  rel,
  'aria-label': ariaLabel,
  ...props
}: LinkProps) {
  const { t } = useClientTranslation()

  const {
    target: resolvedTarget,
    rel: resolvedRel,
    ariaLabel: resolvedAriaLabel,
  } = getExternalLinkProps({
    href,
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL!,
    target,
    rel,
    explicitAriaLabel: ariaLabel,
    children,
    t,
  })

  return (
    <BaseLink
      href={href}
      className={twMerge(
        'text-primary-700 hover:text-primary-800 break-words underline transition-colors',
        className
      )}
      onClick={onClick}
      title={title}
      target={resolvedTarget}
      rel={resolvedRel}
      aria-label={resolvedAriaLabel}
      {...props}>
      {children}
    </BaseLink>
  )
}
