'use client'

import Link from '@/components/Link'
import Trans from '@/components/translation/trans/TransClient'
import ButtonLink from '@/design-system/buttons/ButtonLink'

export default function CommunicationKit() {
  return (
    <div className="flex border-t border-slate-300 py-8 md:gap-10">
      <div>
        <h2>
          <Trans i18nKey="poll.results.communicationKit.title">
            Besoin d'inspiration pour diffuser votre test collectif ?
          </Trans>
        </h2>

        <p>
          <Trans i18nKey="poll.results.communicationKit.text1">
            Nous mettons à votre disposition{' '}
            <Link
              target="_blank"
              rel="noopener noreferrer"
              href="https://app.notion.com/p/Kit-RSE-2026-8-temps-forts-pour-agir-25d6523d57d780e28ad1c4cdfc4922d2">
              un kit de communication ADEME
            </Link>{' '}
            <strong>prêt à l’emploi</strong> pour tous les temps forts de
            l’année, pour encourager le plus de personnes possibles à{' '}
            <strong>rejoindre le challenge</strong>et venir{' '}
            <strong>calculer leur empreinte</strong>.
          </Trans>
        </p>

        <p className="text-secondary-800 mb-8 font-medium">
          <Trans i18nKey="poll.results.communicationKit.text2">
            Des e-mails type, post Linkedin, visuels…
          </Trans>
        </p>

        <ButtonLink
          color="secondary"
          href="https://app.notion.com/p/Kit-RSE-2026-8-temps-forts-pour-agir-25d6523d57d780e28ad1c4cdfc4922d2">
          <Trans i18nKey="poll.results.communicationKit.button">
            Accéder au kit
          </Trans>
        </ButtonLink>
      </div>

      <div></div>
    </div>
  )
}
