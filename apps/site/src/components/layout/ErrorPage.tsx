'use client'

import ErrorIllustration from '@/components/layout/ErrorIllustration'
import Trans from '@/components/translation/trans/TransClient'
import Button from '@/design-system/buttons/Button'
import type { ReactNode } from 'react'

interface Props {
  testId?: string
  illustrationSrc?: string
  title?: ReactNode
}

/** Error page rendered by Next's global error boundary (`app/global-error`). */
export default function ErrorPage({ testId, illustrationSrc, title }: Props) {
  return (
    <main
      data-testid={testId}
      className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-3xl flex-col items-center px-4 py-16 text-center md:py-24">
      {illustrationSrc && <ErrorIllustration src={illustrationSrc} />}

      <h1 className="text-primary-700 mt-8 text-2xl font-bold md:text-4xl">
        {title ?? (
          <Trans i18nKey="common.errors.title">
            Oups, une erreur est survenue
          </Trans>
        )}
      </h1>

      <p className="mt-6 max-w-xl text-lg">
        <Trans i18nKey="common.errors.description">
          L'application rencontre quelques difficultés en ce moment. Nos équipes
          sont prévenues et mettent tout en œuvre pour rétablir la situation au
          plus vite.
        </Trans>
      </p>

      <p className="mt-2 max-w-xl text-lg">
        <Trans i18nKey="common.errors.retryLater">
          Merci de réessayer dans quelques minutes.
        </Trans>
      </p>

      {/* Reloads the current URL, replaying the request that may now succeed. */}
      <Button className="mt-10" onClick={() => window.location.reload()}>
        <Trans i18nKey="common.errors.reload">Recharger la page</Trans>
      </Button>
    </main>
  )
}
