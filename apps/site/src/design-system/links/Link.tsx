'use client'

import NextLink from 'next/link'
import type { ComponentProps } from 'react'
import { useState } from 'react'

type Props = ComponentProps<typeof NextLink>

/**
 * `next/link` that prefetches on intent only — hover, keyboard focus, touch.
 *
 * Next prefetches every link entering the viewport: a footer or a whole
 * catalogue fires one `?_rsc=` request per link, for pages most visitors never
 * open. `prefetch={false}` is not the fix — in the App Router it also disables
 * the hover prefetch — and `unstable_dynamicOnHover` only upgrades a prefetch
 * that is already enabled. Flipping the prop on intent is Next's own recipe:
 * → https://nextjs.org/docs/app/guides/prefetching#hover-triggered-prefetch
 */
export default function Link({
  prefetch,
  onMouseEnter,
  onFocus,
  onTouchStart,
  ...props
}: Props) {
  const [hasIntent, setHasIntent] = useState(false)

  return (
    <NextLink
      {...props}
      prefetch={prefetch === undefined ? (hasIntent ? null : false) : prefetch}
      onMouseEnter={(event) => {
        setHasIntent(true)
        onMouseEnter?.(event)
      }}
      onFocus={(event) => {
        setHasIntent(true)
        onFocus?.(event)
      }}
      onTouchStart={(event) => {
        setHasIntent(true)
        onTouchStart?.(event)
      }}
    />
  )
}
