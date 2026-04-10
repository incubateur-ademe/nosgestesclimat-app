'use client'

import Trans from '@/components/translation/trans/TransClient'
import type { PropsWithChildren } from 'react'

export default function Label({
  children,
  isOptional,
}: PropsWithChildren<{ isOptional?: boolean }>) {
  return (
    <div className="flex justify-between">
      <span>{children}</span>{' '}
      {isOptional && (
        <span className="text-secondary-700 italic">
          <Trans>facultatif</Trans>
        </span>
      )}
    </div>
  )
}
