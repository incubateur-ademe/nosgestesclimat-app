'use client'

import { getExternalLinkProps } from '@/helpers/navigation/externalLink'
import { useClientTranslation } from '@/hooks/useClientTranslation'
import { getIsIframe } from '@/utils/getIsIframe'
import NextLink from 'next/link'
import type { MouseEventHandler } from 'react'
import { twMerge } from 'tailwind-merge'

export interface LinkProps extends React.ComponentProps<typeof NextLink> {
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
  ...props
}: LinkProps) {
  const { t } = useClientTranslation()

  const {
    target: externalTarget,
    rel: externalRel,
    ariaLabel,
  } = getExternalLinkProps({
    href,
    target,
    explicitAriaLabel: props['aria-label'],
    children,
    isIframe: getIsIframe(),
    t,
  })

  const mergedTarget = externalTarget ?? target
  const mergedRel = externalRel ?? props.rel
  const mergedAriaLabel = ariaLabel ?? props['aria-label']

  // Filter out props we already set explicitly to avoid spread overrides
  const { rel: _rel, ['aria-label']: _ariaLabel, ...restProps } = props

  return (
    <NextLink
      href={href}
      className={twMerge(
        'text-primary-700 hover:text-primary-800 wrap-break-words underline transition-colors',
        className
      )}
      onClick={onClick}
      title={title}
      target={mergedTarget}
      rel={mergedRel}
      aria-label={mergedAriaLabel}
      {...restProps}>
      {children}
    </NextLink>
  )
}
