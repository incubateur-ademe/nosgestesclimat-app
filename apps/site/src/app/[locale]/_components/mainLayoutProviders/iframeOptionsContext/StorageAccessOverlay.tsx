'use client'

import Trans from '@/components/translation/trans/TransClient'
import Button from '@/design-system/buttons/Button'
import Card from '@/design-system/layout/Card'

interface Props {
  onAskPermission: () => void
  hasError?: boolean
}

export default function StorageAccessOverlay({
  onAskPermission,
  hasError,
}: Props) {
  return (
    <div className="fixed inset-0 z-1000 overflow-auto bg-black/50">
      <Card className="absolute top-4 left-1/2 z-1000 w-[calc(100%-16px)] -translate-x-1/2 bg-white sm:max-w-lg">
        <h2 className="text-lg md:text-2xl">
          <Trans i18nKey="iframe.safari.title">
            Autorisation requise pour afficher le calculateur d'empreinte
          </Trans>
        </h2>

        <div className="text-sm md:text-base">
          <p>
            <Trans i18nKey="iframe.safari.step1">
              Pour que le calculateur fonctionne, votre navigateur a besoin
              d'accéder aux cookies de Nos Gestes Climat.
            </Trans>
          </p>

          <p>
            <Trans i18nKey="iframe.safari.step2">
              Dans certains cas, une fenêtre s'ouvrira pour confirmer l'action ;
              veuillez cliquer sur "Autoriser" dans celle-ci.
            </Trans>
          </p>

          <div className="mt-4 flex flex-col gap-4">
            {hasError ? (
              <>
                <p className="mb-0 text-sm text-red-600">
                  <Trans i18nKey="iframe.safari.error">
                    Votre navigateur ne permet pas l'accès au stockage local
                    depuis cette page intégrée.
                  </Trans>
                </p>
                <a
                  href={
                    typeof window !== 'undefined'
                      ? window.location.origin
                      : 'https://nosgestesclimat.fr'
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-700 text-center text-sm underline">
                  <Trans i18nKey="iframe.safari.openInNewTab">
                    Ouvrir le calculateur dans un nouvel onglet
                  </Trans>
                </a>
                <Button onClick={onAskPermission} color="secondary" size="sm">
                  <Trans i18nKey="iframe.safari.retry">Réessayer</Trans>
                </Button>
              </>
            ) : (
              <Button onClick={onAskPermission}>
                <Trans i18nKey="iframe.safari.askPermission">Autoriser</Trans>
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  )
}
