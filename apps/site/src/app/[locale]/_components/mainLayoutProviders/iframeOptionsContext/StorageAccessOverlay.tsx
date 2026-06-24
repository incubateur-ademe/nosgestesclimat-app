'use client'

import Trans from '@/components/translation/trans/TransClient'
import Alert from '@/design-system/alerts/alert/Alert'
import Button from '@/design-system/buttons/Button'
import ButtonLink from '@/design-system/buttons/ButtonLink'
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

          <div className="mt-4">
            {hasError ? (
              <Alert
                type="error"
                className="mt-4"
                title={
                  <Trans i18nKey="iframe.safari.errorTitle">
                    Version de Safari incompatible
                  </Trans>
                }
                description={
                  <Trans i18nKey="iframe.safari.errorDescription">
                    Votre version de Safari ne permet pas à notre site de
                    fonctionner correctement dans cette page intégrée. Pour
                    utiliser le calculateur, mettez à jour votre navigateur
                    Safari vers la dernière version ou ouvrez le calculateur
                    dans une nouvelle fenêtre.
                  </Trans>
                }
              />
            ) : null}

            <div className="flex flex-col items-center gap-4">
              {hasError ? (
                <ButtonLink
                  href={
                    typeof window !== 'undefined'
                      ? window.location.origin
                      : 'https://nosgestesclimat.fr'
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  color="secondary"
                  className="mt-2">
                  <Trans i18nKey="iframe.safari.openInNewTab">
                    Ouvrir le calculateur dans un nouvel onglet
                  </Trans>
                </ButtonLink>
              ) : (
                <Button onClick={onAskPermission}>
                  <Trans i18nKey="iframe.safari.askPermission">Autoriser</Trans>
                </Button>
              )}
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
