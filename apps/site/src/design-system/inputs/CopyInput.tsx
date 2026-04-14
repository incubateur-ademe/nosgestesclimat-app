'use client'

import { useClientTranslation } from '@/hooks/useClientTranslation'
import { captureException } from '@sentry/nextjs'
import isMobile from 'is-mobile'
import { useEffect, useRef, useState } from 'react'
import Button from '../buttons/Button'

interface Props {
  textToCopy: string
  textToDisplay?: string
  className?: string
  onClick?: () => void
  canShare?: boolean
  /** Label for the input (optional, auto-generated if not provided) */
  inputLabel?: string
  /** Unique ID for the input (optional, auto-generated if not provided) */
  inputId?: string
}

export default function CopyInput({
  textToCopy,
  textToDisplay,
  className = '',
  onClick,
  canShare,
  inputLabel,
  inputId,
}: Props) {
  const { t } = useClientTranslation()
  const [isCopied, setIsCopied] = useState(false)
  const [isError, setIsError] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const timeoutRef = useRef<NodeJS.Timeout>(undefined)
  const inputRef = useRef<HTMLInputElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const statusRef = useRef<HTMLDivElement>(null)

  // Auto-generate IDs if not provided
  const generatedInputId =
    inputId || `copy-input-${Math.random().toString(36).substr(2, 9)}`
  const generatedLabel =
    inputLabel || t('copyInput.defaultLabel', 'Lien à copier')

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
    setIsLoading(true)
    setIsError(false)

    // For mobile devices
    if (navigator?.share && isMobile()) {
      try {
        return await navigator.share({
          url: textToCopy,
          title: t('copyInput.shareTitle', 'Découvre mon empreinte carbone !'),
        })
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') {
          return
        }
        captureException(err)
        setIsError(true)
      } finally {
        setIsLoading(false)
      }
    }

    // For desktop devices
    if (navigator?.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(textToCopy)
        setIsCopied(true)
        timeoutRef.current = setTimeout(() => setIsCopied(false), 3000)

        // Focus on button after copy for accessibility
        setTimeout(() => {
          buttonRef.current?.focus()
        }, 100)
      } catch (err) {
        captureException(err)
        setIsError(true)
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleButtonClick = async () => {
    await handleShareOrCopy()

    if (onClick) onClick()
  }

  const getButtonText = () => {
    if (isLoading) {
      return canShare && isShareDefined
        ? t('copyInput.sharingInProgress', 'Partage en cours...')
        : t('copyInput.copyingInProgress', 'Copie en cours...')
    }
    if (isCopied) {
      return t('copyInput.copied', 'Copié !')
    }
    if (canShare && isShareDefined) {
      return t('copyInput.share', 'Partager')
    }
    return t('copyInput.copyLink', 'Copier le lien')
  }

  const getButtonAriaLabel = () => {
    if (isLoading) {
      return canShare && isShareDefined
        ? t('copyInput.sharingInProgress', 'Partage en cours...')
        : t('copyInput.copyingInProgress', 'Copie en cours...')
    }
    if (isCopied) {
      return t('copyInput.linkCopiedSuccess', 'Lien copié avec succès')
    }
    if (canShare && isShareDefined) {
      return t('copyInput.shareLink', 'Partager le lien')
    }
    return t(
      'copyInput.copyLinkToClipboard',
      'Copier le lien dans le presse-papiers'
    )
  }

  return (
    <div className={`flex flex-col ${className}`}>
      <div
        className="flex"
        role="group"
        aria-labelledby={`${generatedInputId}-label`}>
        {/* Hidden label for accessibility */}
        <label
          id={`${generatedInputId}-label`}
          htmlFor={generatedInputId}
          className="sr-only">
          {generatedLabel}
        </label>

        <input
          ref={inputRef}
          id={generatedInputId}
          type="text"
          className="focus:ring-primary-700 hidden w-full min-w-0 flex-1 rounded-none rounded-l-md border border-r-0 border-solid border-gray-700 bg-gray-100 py-3 pr-2 pl-4 text-gray-600 focus:ring-2 focus:ring-offset-3 focus:outline-hidden sm:text-sm md:block"
          value={textToDisplay ?? textToCopy}
          readOnly
        />

        <Button
          ref={buttonRef}
          size="sm"
          className="min-w-[9rem]! shrink-0 justify-center md:mx-0 md:rounded-l-none md:px-4 md:py-2"
          onClick={handleButtonClick}
          disabled={isLoading}
          aria-label={getButtonAriaLabel()}
          aria-describedby={`${generatedInputId}-status`}
          aria-live="polite"
          aria-busy={isLoading}>
          {getButtonText()}
        </Button>
      </div>

      {/* Status area for screen readers */}
      <div
        ref={statusRef}
        id={`${generatedInputId}-status`}
        className="sr-only"
        aria-live="polite"
        aria-atomic="true">
        {isLoading && (
          <span>
            {canShare && isShareDefined
              ? t('copyInput.sharingInProgress', 'Partage en cours...')
              : t('copyInput.copyingInProgress', 'Copie en cours...')}
          </span>
        )}
        {isCopied && !isLoading && (
          <span>
            {t(
              'copyInput.linkCopiedToClipboard',
              'Lien copié avec succès dans le presse-papiers'
            )}
          </span>
        )}
        {isError && (
          <span>
            {t('copyInput.copyError', 'Erreur lors de la copie du lien')}
          </span>
        )}
      </div>

      {/* Visible error message */}
      {isError && (
        <p
          className="mt-2 mb-0 text-xs text-red-700"
          role="alert"
          aria-live="assertive">
          {t(
            'copyInput.copyErrorManual',
            'Oups, impossible de copier le lien, vous pouvez le copier manuellement : {{textToCopy}}'
          )}
          {textToCopy}
        </p>
      )}
    </div>
  )
}
