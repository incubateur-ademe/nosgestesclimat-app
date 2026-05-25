'use client'

import Trans from '@/components/translation/trans/TransClient'
import Emoji from '@/design-system/utils/Emoji'

export default function AvantDeCommencer({
  disclaimer = null,
}: {
  disclaimer?: React.ReactNode
}) {
  return (
    <div className="border-rainbow relative mt-6 mb-8 flex flex-col gap-4 rounded-xl bg-gray-100 p-7 md:mt-10">
      <div
        role="presentation"
        aria-hidden
        className="absolute -top-8 inline-block rounded-full bg-gray-100 p-4 text-3xl">
        <Emoji>💡</Emoji>
      </div>
      <h2 className="z-10">
        <Trans>Avant de commencer</Trans>
      </h2>
      {disclaimer}
      <div className="relative pl-8">
        <h3 className="relative overflow-visible font-bold">
          <Emoji className="absolute top-0 -left-8">🏡</Emoji>
          <Trans>C'est un test individuel !</Trans>
        </h3>
        <p className="text-sm md:text-base">
          <Trans>
            Répondez aux questions en votre nom, pas pour votre foyer.
          </Trans>
          <span className="hidden md:inline">
            {' '}
            <Trans>
              Bien sûr, certaines choses sont partagées (au sein de mon logement
              avec ma famille, la voiture avec les covoitureurs) : cela sera
              bien pris en compte dans le calcul de votre empreinte carbone, ne
              vous inquiétez pas !
            </Trans>
          </span>
        </p>
      </div>

      <div className="relative pl-8">
        <h3 className="relative overflow-visible font-bold">
          <Emoji className="absolute top-0 -left-8">👤</Emoji>
          <Trans>
            Il concerne votre vie personnelle, et non pas votre activité.
          </Trans>
        </h3>
      </div>

      <div className="relative pl-8">
        <h3 className="relative overflow-visible font-bold">
          <Emoji className="absolute top-0 -left-8">🧮</Emoji>
          <Trans>Vous débutez votre test avec un score de départ.</Trans>
        </h3>
        <p className="text-sm md:text-base">
          <span className="">
            <Trans>
              Ce dernier est calculé à partir de réponses par défaut attribuées
              à l’avance à chaque question. Si vous passez une question, ces
              mêmes réponses seront prises en compte.
            </Trans>
          </span>
        </p>
      </div>
    </div>
  )
}
