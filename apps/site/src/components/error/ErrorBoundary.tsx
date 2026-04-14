'use client'
import { captureException } from '@sentry/nextjs'
import type { ReactNode } from 'react'
import React from 'react'
import ErrorContent from './ErrorContent'

interface ErrorBoundaryProps {
  children: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error) {
    // Send error to Sentry
    captureException(error)
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
