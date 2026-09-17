'use client'

import Trans from '@/components/translation/trans/TransClient'
import Button from '@/design-system/buttons/Button'
import Image from 'next/image'
import type { ReactNode } from 'react'

interface Props {
  testId?: string
  illustrationSrc?: string
  title?: ReactNode
  description?: ReactNode
  /** Rendered below the reload button, e.g. the /app-crash carbon quiz. */
  children?: ReactNode
}

/** Content shared by `/app-crash` and the 500 page (`layout/500`). */
export default function ErrorPage({
  testId,
  illustrationSrc,
  title,
  description,
  children,
}: Props) {
  return (
    <main
      data-testid={testId}
      className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-3xl flex-col items-center px-4 py-16 text-center md:py-24">
      {illustrationSrc && (
        // `unoptimized`: the image must not depend on the Next optimizer
        // (`/_next/image`), unavailable when the app is down.
        <Image
          src={illustrationSrc}
          width={280}
          height={280}
          alt=""
          priority
          unoptimized
        />
      )}

      <h1 className="text-primary-700 mt-8 mb-0 text-2xl font-bold md:text-4xl">
        {title ?? (
          <Trans i18nKey="common.errors.title">
            Oups, une erreur est survenue
          </Trans>
        )}
      </h1>

      <p className="mt-4 max-w-xl text-lg">
        {description ?? (
          <Trans i18nKey="common.errors.description">
            L'application rencontre quelques difficultés en ce moment. Nos
            équipes sont prévenues et mettent tout en œuvre pour rétablir la
            situation au plus vite.
          </Trans>
        )}
      </p>

      {!description && (
        <p className="mt-2 max-w-xl text-lg">
          <Trans i18nKey="common.errors.retryLater">
            Merci de réessayer dans quelques minutes.
          </Trans>
        </p>
      )}

      {/* Reloads the current URL: on /app-crash the browser URL is still the one
          that failed, so the requested page is replayed. */}
      <Button className="mt-10" onClick={() => window.location.reload()}>
        <Trans i18nKey="common.errors.reload">Recharger la page</Trans>
      </Button>

      {children}
    </main>
  )
}
