'use client'

import Trans from '@/components/translation/trans/TransClient'
import ButtonLink from '@/design-system/buttons/ButtonLink'

export default function PollNotFound() {
  return (
    <>
      <h1 className="text-xl">
        <Trans>
          Oups, nous n'avons pas trouvé les résultats de ce test collectif
        </Trans>
      </h1>

      <p>
        Il semblerait que ce test collectif n'ait pas encore de résultats ou
        bien qu'une erreur soit survenue.
      </p>

      <ButtonLink href="/organisations">Revenir à l'écran d'accueil</ButtonLink>
    </>
  )
}
