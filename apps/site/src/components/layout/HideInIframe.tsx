'use client'

import { useShouldHideIfIframe } from '@/hooks/iframe/useShouldHideIfIframe'
import type { PropsWithChildren } from 'react'

interface Props {
  hideIfNotFrenchRegion?: boolean
}

export default function HideInIframe({
  children,
  hideIfNotFrenchRegion = false,
}: PropsWithChildren<Props>) {
  const shouldHideChildren = useShouldHideIfIframe({
    hideIfNotFrenchRegion,
  })

  if (shouldHideChildren) return null

  return children
}
