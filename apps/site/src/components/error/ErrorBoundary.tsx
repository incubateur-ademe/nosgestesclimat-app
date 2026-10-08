'use client'
import logger from '@/logger/logger.browser'
import { toError } from '@nosgestesclimat/core/lib/to-error'
import type { ReactNode } from 'react'
import React from 'react'
import ErrorContent from './ErrorContent'

interface ErrorBoundaryProps {
  children: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: unknown
}

class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: unknown): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: unknown) {
    // The boundary swallows the failure, so nothing else reports it.
    logger.error(toError(error), { scope: 'site.view.errorBoundary' })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-screen flex-col items-center justify-center">
          <ErrorContent />
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
