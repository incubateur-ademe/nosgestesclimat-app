'use client'

import Link from '@/components/Link'
import Trans from '@/components/translation/trans/TransClient'
import ButtonLink from '@/design-system/buttons/ButtonLink'
import Image from 'next/image'

export default function CommunicationKit() {
  return (
    <div className="relative my-8 flex flex-col items-stretch gap-10 border-t border-slate-300 py-8 md:flex-row">
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
            <strong>rejoindre le challenge</strong> et venir{' '}
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

      <div className="relative mx-auto h-70 w-60 md:mx-0 md:mr-16 md:min-w-75">
        <div className="absolute inset-0">
          <Image
            src="https://nosgestesclimat-prod.s3.fr-par.scw.cloud/cms/illu_1_kit_communication_a6321fe7ec.png"
            width="200"
            height="200"
            className="border border-slate-300 object-contain"
            alt=""
          />
        </div>
        <div className="absolute top-1/2 right-0 z-10 -translate-y-1/2">
          <Image
            src="https://nosgestesclimat-prod.s3.fr-par.scw.cloud/cms/illu_2_kit_communication_e7769e5e6b.png"
            width="150"
            height="150"
            alt=""
            className="border border-slate-300 shadow-lg"
          />
        </div>
      </div>
    </div>
  )
}
