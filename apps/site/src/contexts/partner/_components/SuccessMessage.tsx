'use client'

import RedirectTimer from '@/components/interactions/RedirectTimer'
import Trans from '@/components/translation/trans/TransClient'
import ButtonLink from '@/design-system/buttons/ButtonLink'
import Title from '@/design-system/layout/Title'
import Emoji from '@/design-system/utils/Emoji'

export default function SuccessMessage({
  redirectUrl,
}: {
  redirectUrl: string
}) {
  return (
    <div className="xs:text-left text-center">
      <Title
        title={
          <span className="inline-block">
            <Trans>Vous avez terminé le test !</Trans> <Emoji>💪</Emoji>
          </span>
        }
        tag="h2"
      />
      <p className="text-sm md:text-base">
        <Trans>Merci d'avoir complété votre test.</Trans>
      </p>
      <p className="text-sm md:text-base">
        <Trans>
          Nous vous redirigerons vers le site de notre partenaire dans :
        </Trans>
      </p>

      <RedirectTimer duration={40} className="text-lg" href={redirectUrl} />

      <span className="mt-8 flex w-full justify-start">
        <ButtonLink
          size="sm"
          color="primary"
          data-testid="button-redirect"
          href={redirectUrl}>
          Revenir au site partenaire
        </ButtonLink>
      </span>
    </div>
  )
}
