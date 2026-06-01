'use client'

import Trans from '@/components/translation/trans/TransClient'
import Button from '@/design-system/buttons/Button'
import Card from '@/design-system/layout/Card'

interface StorageAccessError {
  name: string
  message: string
}

interface Props {
  onAskPermission: () => void
  error?: StorageAccessError | null
}

export default function StorageAccessOverlay({
  onAskPermission,
  error,
}: Props) {
  return (
    <div className="fixed inset-0 z-1000 overflow-auto bg-black/50">
      <Card className="absolute top-4 left-1/2 z-1000 w-[calc(100%-16px)] -translate-x-1/2 bg-white sm:max-w-lg">
        <h2 className="text-lg md:text-2xl">
          <Trans i18nKey="iframe.safari.title">
            Autorisation des cookies requise
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
              Cliquez sur le bouton ci-dessous puis sur "Autoriser" dans la
              fenêtre qui s'affichera.
            </Trans>
          </p>
          {error && (
            <p className="mt-2 rounded border border-red-300 bg-red-50 p-2 text-red-700">
              Erreur : {error.name} — {error.message}
            </p>
          )}
          <div className="mt-4">
            <Button onClick={onAskPermission}>
              <Trans i18nKey="iframe.safari.askPermission">Autoriser</Trans>
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
