'use client'

import Alert from '@/design-system/alerts/alert/Alert'
import { cn } from 'cn'
import type { PropsWithChildren } from 'react'
import DefaultErrorMessage from './DefaultErrorMessage'

export default function DefaultErrorAlert({
  children,
  className,
}: PropsWithChildren<{ className?: string }>) {
  return (
    <Alert
      type="error"
      data-testid="default-error-alert"
      className={cn('mb-6', className)}
      description={children ?? <DefaultErrorMessage />}
    />
  )
}
