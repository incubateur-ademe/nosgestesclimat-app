import TitleDescLinkBlock from '@/components/landing-pages/TitleDescLinkBlock'
import Trans from '@/components/translation/trans/TransServer'

export default function ModelInfo({ locale }: { locale: string }) {
  return (
    <div className="bg-heroLightBackground px-4 py-12 md:py-20">
      <div className="flex flex-col items-center gap-10 md:mx-auto md:max-w-5xl">
        <h2 className="text-center text-2xl md:text-3xl">
          <Trans locale={locale}>Un modèle de calcul fiable</Trans>
        </h2>

        <div className="flex flex-col gap-16 md:flex-row md:gap-10">
          <TitleDescLinkBlock
            title={
              <Trans locale={locale}>Basé sur les données de l’ADEME</Trans>
            }
            description={
              <>
                <Trans locale={locale}>Retrouvez toute l’expertise de</Trans>{' '}
                <strong className="text-primary-600">
                  <Trans locale={locale}>
                    l’Agence de la Transition Écologique
                  </Trans>
                </strong>{' '}
                <Trans locale={locale}>
                  dans le calculateur de Nos Gestes Climat : données,
                  perspectives, leviers d'action.
                </Trans>
              </>
            }
            link={{
              href: '/documentation',
              text: <Trans locale={locale}>Découvrir la documentation</Trans>,
            }}
          />

          <TitleDescLinkBlock
            title={<Trans locale={locale}>Libre et documenté</Trans>}
            description={
              <Trans locale={locale}>
                Les lignes de code, les données et même une grande partie des
                réflexions méthodologiques derrière le calculateur sont toutes{' '}
                <strong className="text-primary-600">accessibles</strong>, ce
                qui permet à qui veut de{' '}
                <strong className="text-primary-600">
                  contribuer et améliorer l’outil
                </strong>
                .
              </Trans>
            }
            link={{
              href: '/nouveautes',
              text: <Trans locale={locale}>Voir les nouveautés</Trans>,
            }}
          />
        </div>
      </div>
    </div>
  )
}
