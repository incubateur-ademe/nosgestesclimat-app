'use client'

import Trans from '@/components/translation/trans/TransClient'
import Button from '@/design-system/buttons/Button'
import Image from 'next/image'
import type { ReactNode } from 'react'

interface Props {
  /** `data-testid` posé sur le `<main>`. */
  testId?: string
  /** Illustration optionnelle affichée au-dessus du titre. */
  illustrationSrc?: string
  /** Titre optionnel, sinon le titre d'erreur par défaut. */
  title?: ReactNode
}

/**
 * Contenu de page d'erreur partagé entre la page `/app-crash` (servie par
 * nginx sur indisponibilité/timeout, 502/503/504) et la page 500 de l'app
 * (voir `components/layout/500`).
 *
 * Composant client pour pouvoir être rendu aussi bien depuis un Server
 * Component (`app-crash/page.tsx`) que depuis `app/global-error.tsx`.
 */
export default function ErrorPage({ testId, illustrationSrc, title }: Props) {
  return (
    <main
      data-testid={testId}
      className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-3xl flex-col items-center px-4 py-16 text-center md:py-24">
      {illustrationSrc && (
        // `unoptimized` : l'image ne doit pas dépendre de l'optimiseur Next
        // (`/_next/image`), indisponible si l'app est HS.
        <Image
          src={illustrationSrc}
          width={280}
          height={280}
          alt=""
          priority
          unoptimized
        />
      )}

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

      {/* Recharge l'URL courante : sur /app-crash, l'URL du navigateur reste
          celle qui a échoué, on rejoue donc bien la page demandée. */}
      <Button className="mt-10" onClick={() => window.location.reload()}>
        <Trans i18nKey="common.errors.retry">Réessayer</Trans>
      </Button>
    </main>
  )
}
