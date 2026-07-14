'use client'

import { useClientTranslation } from '@/hooks/useClientTranslation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PropsWithChildren,
} from 'react'
import { twMerge } from 'tailwind-merge'
import Loader from '../layout/Loader'
import type { ButtonColor } from './Button'
import {
  baseClassNames,
  colorClassNames,
  loaderColorMap,
  sizeClassNames,
} from './Button'
import { useButtonState } from './useButtonState'

const HALO_DURATION = 1

interface AutoRedirectButtonLinkProps {
  href: string
  /** Duration of the progress animation in seconds (default: 3) */
  duration?: number
  /** Delay before the progress animation starts in seconds (default: 2.5) */
  startDelay?: number
  className?: string
  color?: ButtonColor
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  /** Tailwind class for the progress bar fill color (default: 'bg-primary-900') */
  progressBarClassName?: string
  /** Tailwind class for the halo color (default: 'bg-primary-700/20') */
  haloClassName?: string
}

export default function AutoRedirectButtonLink({
  href,
  children,
  duration = 3,
  startDelay = 2.5,
  className,
  color = 'primary',
  size = 'md',
  progressBarClassName = 'bg-primary-900',
  haloClassName = 'bg-primary-700/20',
}: PropsWithChildren<AutoRedirectButtonLinkProps>) {
  const router = useRouter()
  const { t } = useClientTranslation()
  const [showProgress, setShowProgress] = useState(false)
  const [showHalo, setShowHalo] = useState(false)
  const [isRedirecting, setIsRedirecting] = useState(false)

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const redirectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const { isDisabled, showLoader } = useButtonState({
    loading: isRedirecting,
  })

  // Effect to show the progress bar after startDelay
  useEffect(() => {
    timeoutRef.current = setTimeout(
      () => setShowProgress(true),
      startDelay * 1000
    )
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [startDelay])

  // Effect to perform navigation when redirecting
  useEffect(() => {
    if (!isRedirecting) return

    router.push(href)
  }, [isRedirecting, router, href])

  const cancelAutoRedirect = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    if (redirectTimeoutRef.current) {
      clearTimeout(redirectTimeoutRef.current)
      redirectTimeoutRef.current = null
    }
    setShowProgress(false)
    setShowHalo(false)
    setIsRedirecting(true)
  }, [])

  // When the progress bar fills, show the halo and schedule the redirect
  const handleProgressComplete = useCallback(() => {
    setShowHalo(true)

    redirectTimeoutRef.current = setTimeout(() => {
      setIsRedirecting(true)
    }, HALO_DURATION * 1000)
  }, [])

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      if (isDisabled) {
        e.preventDefault()
        return
      }
      cancelAutoRedirect()
    },
    [isDisabled, cancelAutoRedirect]
  )

  return (
    <div className="relative inline-flex">
      <Link
        href={href}
        onClick={handleClick}
        className={twMerge(
          `${baseClassNames} ${sizeClassNames[size]} ${colorClassNames[color]}`,
          'relative overflow-hidden',
          isDisabled && 'cursor-not-allowed opacity-50!',
          className
        )}
        role={isRedirecting ? undefined : 'progressbar'}
        aria-valuenow={0}
        aria-valuemax={100}
        aria-label={
          isRedirecting
            ? t('common.redirecting', 'Redirection en cours')
            : t(
                'common.autoRedirect',
                'Redirection automatique dans {{seconds}} secondes',
                { seconds: duration }
              )
        }
        aria-disabled={isDisabled ? true : undefined}>
        {showProgress && (
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration, ease: 'linear' }}
            className={twMerge(
              'absolute inset-0 origin-left rounded-full',
              progressBarClassName
            )}
            onAnimationComplete={handleProgressComplete}
          />
        )}
        {showLoader && (
          <Loader
            size="sm"
            color={loaderColorMap[color]}
            className="relative z-10 mr-2"
          />
        )}
        <span className="relative z-10">{children}</span>
      </Link>
      {/* Halo outside the button to avoid overflow-hidden clipping */}
      {showHalo && (
        <motion.div
          initial={{ scale: 0, opacity: 1 }}
          animate={{ scale: 2, opacity: 0 }}
          transition={{ duration: HALO_DURATION, ease: [0.34, 1.4, 0.64, 1] }}
          className={twMerge(
            'pointer-events-none absolute inset-0 h-full w-full rounded-full',
            haloClassName
          )}
        />
      )}
    </div>
  )
}
