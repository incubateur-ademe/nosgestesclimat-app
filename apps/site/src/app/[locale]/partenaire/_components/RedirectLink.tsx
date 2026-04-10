'use client'

import ButtonLink from '@/design-system/buttons/ButtonLink'
import type { PropsWithChildren } from 'react'

export default function RedirectLink({
  href,
  children,
}: PropsWithChildren<{ href: string }>) {
  return (
    <ButtonLink className="px-3" size="sm" href={href}>
      {children}
    </ButtonLink>
  )
}
