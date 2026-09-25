'use client'

import Alert from '@/design-system/alerts/alert/Alert'
import type { PropsWithChildren } from 'react'
import DefaultErrorMessage from './DefaultErrorMessage'
import { twMerge } from "cn";

export default function DefaultErrorAlert({
  children,
  className,
}: PropsWithChildren<{ className?: string }>) {
  return (
    <Alert
      type="error"
      data-testid="default-error-alert"
      className={twMerge('mb-6', className)}
      description={children ?? <DefaultErrorMessage />}
    />
  )
}
