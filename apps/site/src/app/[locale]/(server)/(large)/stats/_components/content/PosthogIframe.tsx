'use client'

import Trans from '@/components/translation/trans/TransClient'
import Loader from '@/design-system/layout/Loader'
import { useState } from 'react'

interface Props {
  id: string
  title: string
  src: string
  height: string
  description: string
}

export default function PosthogIframe({
  id,
  title,
  src,
  height,
  description,
}: Props) {
  const [isIFrameLoaded, setIsIFrameLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)

  return (
    <div className="iframe-container">
      {!isIFrameLoaded && !hasError && (
        <div
          className="flex items-center justify-center rounded-lg border border-gray-200 p-8"
          role="status"
          aria-live="polite">
          <Loader color="dark" className="mr-3" />
          <span>
            <Trans>Chargement du tableau de bord...</Trans>
          </span>
        </div>
      )}

      {hasError && (
        <div
          className="rounded-lg border border-red-200 bg-red-50 p-4"
          role="alert"
          aria-live="assertive">
          <p className="text-red-800">
            <Trans>
              Impossible de charger le tableau de bord. Veuillez réessayer plus
              tard.
            </Trans>
          </p>
        </div>
      )}

      {/* Description pour les lecteurs d'écran */}
      {description && (
        <p className="sr-only" id={`${id}-description`}>
          {description}
        </p>
      )}
      <iframe
        id={id}
        title={title}
        src={src}
        width="100%"
        // Fix height for mobile
        height={height}
        sandbox="allow-scripts allow-same-origin allow-popups"
        className="rounded-xl border-none"
        aria-describedby={description ? `${id}-description` : undefined}
        onLoad={() => setIsIFrameLoaded(true)}
        onError={() => setHasError(true)}
        aria-label={`${title} - Contenu externe de Metabase`}
      />
    </div>
  )
}
