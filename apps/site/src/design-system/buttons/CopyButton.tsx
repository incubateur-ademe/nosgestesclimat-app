'use client'

import Trans from '@/components/translation/trans/TransClient'
import { useClientTranslation } from '@/hooks/useClientTranslation'
import { captureException } from '@sentry/nextjs'
import isMobile from 'is-mobile'
import type { PropsWithChildren, ReactNode } from 'react'
import { useEffect, useRef, useState } from 'react'
import { twMerge } from 'tailwind-merge'
import Alert from '../alerts/alert/Alert'
import Button, { type ButtonProps } from './Button'

interface Props {
  color?: ButtonProps['color']
  textToCopy: string
  className?: string
  copiedStateText?: ReactNode
  onCopied?: () => void
  canShare?: boolean
  shareTitle?: string
  'data-testid'?: string
}

export default function CopyButton({
  children,
  color = 'text',
  textToCopy,
  className = '',
  copiedStateText,
  onCopied,
  canShare = true,
  shareTitle,
  'data-testid': dataTestId,
}: PropsWithChildren<Props>) {
  const { t } = useClientTranslation()
  const [isCopied, setIsCopied] = useState(false)
  const [isError, setIsError] = useState(false)

  const timeoutRef = useRef<NodeJS.Timeout>(undefined)
  const buttonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  const isShareDefined =
    typeof navigator !== 'undefined' && navigator.share !== undefined

  const handleShareOrCopy = async () => {
    setIsError(false)

    // For mobile devices with native sharing
    if (canShare && navigator?.share && isMobile()) {
      try {
        await navigator.share({
          url: textToCopy,
          title:
            shareTitle ||
            t('copyButton.shareTitle', 'Découvre mon empreinte carbone !'),
        })
        return
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') {
          return
        }
        captureException(err)
        setIsError(true)
      }
    }

    // For desktop devices or fallback
    if (navigator?.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(textToCopy)
        setIsCopied(true)
        onCopied?.()
        timeoutRef.current = setTimeout(() => setIsCopied(false), 3000)

        // Focus on button after copy for accessibility
        setTimeout(() => {
          buttonRef.current?.focus()
        }, 100)
      } catch (err) {
        captureException(err)
        setIsError(true)
      }
    }
  }

  const getButtonText = () => {
    if (isCopied) {
      return (
        copiedStateText ?? (
          <span>
            <Trans>Copié !</Trans>
          </span>
        )
      )
    }
    return children ?? <Trans>Copier le lien</Trans>
  }

  const getButtonAriaLabel = () => {
    if (isCopied) {
      return t(
        'copyButton.copiedAriaLabel',
        'Lien copié dans le presse-papiers'
      )
    }
    if (canShare && isShareDefined && isMobile()) {
      return t('copyButton.shareAriaLabel', 'Partager le lien')
    }
    return t(
      'copyButton.copyAriaLabel',
      'Copier le lien dans le presse-papiers'
    )
  }

  return (
    <>
      <Button
        ref={buttonRef}
        color={color}
        className={twMerge('w-full', className)}
        onClick={handleShareOrCopy}
        aria-label={getButtonAriaLabel()}
        aria-live="polite"
        data-testid={dataTestId}>
        {getButtonText()}
      </Button>

      {isError && (
        <Alert
          type="error"
          className="mt-2"
          title={<Trans>Oups, la copie du lien a échoué, le voici :</Trans>}
          description={textToCopy}
        />
      )}
    </>
  )
}
