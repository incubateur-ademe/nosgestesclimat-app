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
  /**
   * Rendered full-width, below the reload button, e.g. the /app-crash carbon
   * quiz. Kept as a sibling of `<main>` (not nested in its centered
   * `max-w-3xl` column) so it can span the full page width naturally.
   */
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
    <>
      <main
        data-testid={testId}
        className={`mx-auto flex w-full flex-col items-center px-4 text-center ${
          children
            ? 'max-w-6xl gap-4 py-8 md:max-h-[70vh] md:justify-center md:py-12'
            : 'max-w-3xl gap-6 py-16 min-h-[calc(100vh-5rem)] md:py-24'
        }`}>
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

        <h1
          className={`mb-0 font-bold ${
            children
              ? 'text-4xl tracking-tight text-balance md:text-5xl'
              : 'text-primary-700 text-2xl md:text-4xl'
          }`}>
          {title ?? (
            <Trans i18nKey="common.errors.title">
              Oups, une erreur est survenue
            </Trans>
          )}
        </h1>

        <p className="mb-0 max-w-xl text-lg">
          {description ?? (
            <Trans i18nKey="common.errors.description">
              L'application rencontre quelques difficultés en ce moment. Nos
              équipes sont prévenues et mettent tout en œuvre pour rétablir la
              situation au plus vite.
            </Trans>
          )}
        </p>

        {!description && (
          <p className="mb-0 max-w-xl text-lg">
            <Trans i18nKey="common.errors.retryLater">
              Merci de réessayer dans quelques minutes.
            </Trans>
          </p>
        )}

        {/* Reloads the current URL: on the generic 500 page, this actually
            replays a request that may now succeed. Not shown on /app-crash,
            where reloading during an outage just adds load and contradicts
            the "please wait" message below. */}
        {!children && (
          <Button onClick={() => window.location.reload()}>
            <Trans i18nKey="common.errors.reload">Recharger la page</Trans>
          </Button>
        )}
      </main>

      {children}
    </>
  )
}
