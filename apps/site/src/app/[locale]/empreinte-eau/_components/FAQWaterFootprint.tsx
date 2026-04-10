import FAQ from '@/components/landing-pages/FAQ'
import Link from '@/components/Link'
import Trans from '@/components/translation/trans/TransServer'
import { getServerTranslation } from '@/helpers/getServerTranslation'
import type { Locale } from '@/i18nConfig'
export default async function FAQWaterFootprint({
  locale,
}: {
  locale: Locale
}) {
  const { t } = await getServerTranslation({ locale })

  return (
    <FAQ
      locale={locale}
      className="mb-16"
      subTitle={
        <Trans locale={locale}>Vos questions sur l'empreinte eau</Trans>
      }
      questions={[
        {
          question: (
            <Trans locale={locale}>Comment calculer l’empreinte eau ?</Trans>
          ),
          answer: (
            <>
              <p>
                <Trans locale={locale}>
                  Sur le site Nos Gestes Climat, le calcul de l'empreinte eau se
                  fait simultanément avec le calcul de l'empreinte carbone.
                </Trans>
              </p>
              <p>
                <Trans locale={locale}>
                  Au travers{' '}
                  <Link href="/">du calculateur Nos Gestes Climat</Link>, nous
                  calculons{' '}
                  <strong className="text-primary-700">
                    la quantité d’eau consommée par chacun de vos usages
                  </strong>{' '}
                  (achat d’un produit ou aliment, utilisation d’un service,
                  consommations d’énergies).
                </Trans>
              </p>
              <p>
                <Trans locale={locale}>
                  Ainsi, en calculant votre empreinte carbone, vous obtenez
                  également{' '}
                  <strong className="text-primary-700">
                    une estimation de votre empreinte eau
                  </strong>{' '}
                  pour une vision complète de votre impact.
                </Trans>
              </p>
              <p className="mb-0">
                <Trans locale={locale}>
                  Il existe plusieurs méthodes pour calculer une empreinte eau.
                  Chacune présente des avantages, et aucune à ce stade ne permet
                  de saisir toute la complexité de la question des impacts de
                  l’humain sur le cycle de l’eau. Notre choix s’est porté sur la
                  méthode AWARE , qui permet de valoriser à sa juste mesure le
                  stress hydrique des régions concernées par les consommations
                  d’eau. C’est la méthode recommandée par la convention
                  européenne, et plébiscitée par l’ADEME pour ses calculs d’ACV.
                </Trans>
              </p>
            </>
          ),
        },
        {
          question: (
            <Trans locale={locale}>
              Pourquoi l'eau domestique n'est-elle pas incluse dans l'empreinte
              eau ?
            </Trans>
          ),
          answer: (
            <>
              <p>
                <Trans locale={locale}>
                  <strong className="text-primary-700">L’eau domestique</strong>
                  , celle qui sort de vos robinets pour la douche, la cuisine,
                  le ménage... n'est pas incluse dans l'empreinte eau car elle
                  est en grande majorité{' '}
                  <strong className="text-primary-700">
                    restituée dans le même bassin versant
                  </strong>{' '}
                  après traitement.
                </Trans>
              </p>

              <p>
                <Trans locale={locale}>
                  Une fois utilisée, cette eau est{' '}
                  <strong className="text-primary-700">dépolluée</strong> puis{' '}
                  <strong className="text-primary-700">renvoyée</strong> dans
                  les cours d'eau locaux.
                </Trans>
              </p>

              <p>
                <Trans locale={locale}>
                  Ce n’est pas parce qu’elle n’est pas incluse qu’elle n’est pas
                  importante ! Régulièrement, de nombreux territoires français
                  sont soumis à{' '}
                  <strong className="text-primary-700">
                    des restrictions d’eau liées à des périodes de sécheresse
                  </strong>
                  . Il est important de réduire sa consommation d'eau domestique
                  pour mieux partager cette{' '}
                  <strong className="text-primary-700">ressource vitale</strong>{' '}
                  et limiter les pressions sur les réserves locales.
                </Trans>
              </p>

              <p className="mb-0">
                <Trans locale={locale}>
                  Pour aller plus loin :{' '}
                  <a
                    href="/blog/environnement/lexique-eau-tout-comprendre"
                    target="_blank"
                    rel="noopener"
                    aria-label={t(
                      "Lire l'article sur le lexique pour tout comprendre à l'empreinte eau, nouvelle page"
                    )}>
                    Le lexique pour tout comprendre à l’empreinte eau
                  </a>
                </Trans>
              </p>
            </>
          ),
        },
        {
          question: (
            <Trans locale={locale}>
              Qu'est-ce que l'eau verte, l'eau bleue et l'eau grise ?
            </Trans>
          ),
          answer: (
            <>
              <p>
                <Trans locale={locale}>
                  Il existe plusieurs distinctions, qui permettent de valoriser
                  les différences qualitatives d’impact de l’humain sur le cycle
                  de l’eau. La couleur de l’eau en est une majeure :
                </Trans>
              </p>
              <ul className="mb-4 flex list-disc flex-col gap-2 pl-3">
                <li>
                  <Trans locale={locale}>
                    <strong className="text-primary-700">Eau bleue</strong> :{' '}
                    eau de surface et souterraine prélevée pour l’irrigation, la
                    production industrielle ou l'énergie ;
                  </Trans>
                </li>
                <li>
                  <Trans locale={locale}>
                    <strong className="text-primary-700">Eau verte</strong> :{' '}
                    eau de pluie absorbée par les sols, utilisée pour les
                    cultures sans irrigation artificielle ;
                  </Trans>
                </li>
                <li>
                  <Trans locale={locale}>
                    <strong className="text-primary-700">Eau grise</strong> :{' '}
                    quantité d’eau nécessaire pour diluer les polluants générés
                    par la production d’un bien ou service.
                  </Trans>
                </li>
              </ul>

              <p>
                <Trans locale={locale}>
                  La méthodologie AWARE que nous utilisons pour calculer
                  l’empreinte eau se concentre sur les prélèvements d’eau, à
                  savoir{' '}
                  <strong className="text-primary-700">l’eau bleue</strong>.
                  Elle ne tient pas compte de l’eau grise.
                </Trans>
              </p>

              <p className="mb-0">
                <Trans locale={locale}>
                  Pour aller plus loin :{' '}
                  <a
                    href="/blog/environnement/lexique-eau-tout-comprendre"
                    target="_blank"
                    rel="noopener"
                    aria-label={t(
                      "Lire l'article sur le lexique pour tout comprendre à l'empreinte eau, nouvelle page"
                    )}>
                    Le lexique pour tout comprendre à l’empreinte eau
                  </a>
                </Trans>
              </p>
            </>
          ),
        },
        {
          question: (
            <Trans locale={locale}>
              Quels sont les exemples d'empreinte eau de certains produits ?
            </Trans>
          ),
          answer: (
            <>
              <p>
                <Trans locale={locale}>
                  Voici quelques exemples d’empreinte eau pour des{' '}
                  <strong className="text-primary-700">
                    produits courants
                  </strong>
                  :
                </Trans>
              </p>

              <ul className="mb-4 flex list-disc flex-col gap-2 pl-3">
                <li>
                  <Trans locale={locale}>
                    <strong className="text-primary-700">Un jean</strong> :{' '}
                    environ 30 000 litres d’eau, principalement pour la culture
                    du coton ;
                  </Trans>
                </li>
                <li>
                  <Trans locale={locale}>
                    <strong className="text-primary-700">
                      Un hamburger de bœuf
                    </strong>{' '}
                    : environ 380 litres d’eau ;
                  </Trans>
                </li>
                <li>
                  <Trans locale={locale}>
                    <strong className="text-primary-700">
                      Une tasse de café
                    </strong>{' '}
                    : 64 litres d’eau, de la culture à la transformation ;
                  </Trans>
                </li>
                <li>
                  <Trans locale={locale}>
                    <strong className="text-primary-700">Un kilo de riz</strong>{' '}
                    : 14 000 litres d’eau ;
                  </Trans>
                </li>
                <li>
                  <Trans locale={locale}>
                    <strong className="text-primary-700">
                      Un kilo de pommes de terre
                    </strong>{' '}
                    : 330 litres d’eau ;
                  </Trans>
                </li>
                <li>
                  <Trans locale={locale}>
                    <strong className="text-primary-700">
                      Une tablette de chocolat (150g)
                    </strong>{' '}
                    : 235 litres d’eau ;
                  </Trans>
                </li>
                <li>
                  <Trans locale={locale}>
                    <strong className="text-primary-700">
                      Un litre de lait
                    </strong>{' '}
                    : environ 330 litres d’eau ;
                  </Trans>
                </li>
                <li>
                  <Trans locale={locale}>
                    <strong className="text-primary-700">Un œuf</strong> : 75
                    litres d’eau ;
                  </Trans>
                </li>
                <li>
                  <Trans locale={locale}>
                    <strong className="text-primary-700">
                      Une baguette de pain
                    </strong>{' '}
                    : 40 litres d’eau.
                  </Trans>
                </li>
              </ul>

              <p className="mb-0">
                <Trans locale={locale}>
                  De l’eau se cache derrière toutes nos consommations, dans des
                  proportions que nous ne soupçonnons pas toujours !
                </Trans>
              </p>
            </>
          ),
        },
        {
          question: (
            <Trans locale={locale}>
              Quelle est l'empreinte eau moyenne d'un habitant français ?
            </Trans>
          ),
          answer: (
            <>
              <p>
                <Trans locale={locale}>
                  L’empreinte eau d’un français est de plusieurs milliers de
                  litres par jour :{' '}
                  <strong className="text-primary-700">entre 4 et 8000</strong>,
                  en moyenne.
                </Trans>
              </p>

              <p className="mb-0">
                <Trans locale={locale}>
                  À la différence de l’empreinte carbone, nous ne disposons pas
                  encore de données consolidées à l’échelle de la France, ni
                  d’objectifs à atteindre. Mais nous avons déjà une vision assez
                  juste des conséquences de notre accaparement de cette
                  précieuse ressource{' '}
                  <strong className="text-primary-700">
                    pour l’ensemble du vivant
                  </strong>
                  . Nous pouvons agir collectivement pour réduire notre
                  empreinte eau.
                </Trans>
              </p>
            </>
          ),
        },
        {
          question: (
            <Trans locale={locale}>
              L’empreinte eau aboutit-elle aux mêmes conclusions que l’empreinte
              carbone ?
            </Trans>
          ),
          answer: (
            <>
              <p>
                <Trans locale={locale}>
                  Empreinte eau et empreinte carbone se répondent.
                </Trans>
              </p>

              <p>
                <Trans locale={locale}>
                  Une hausse de 1 degré de la température du globe entraîne{' '}
                  <strong className="text-primary-700">
                    une hausse de 7% du taux d’humidité
                  </strong>{' '}
                  dans l’atmosphère. L’eau s’évapore plus, plus vite, et les
                  phénomènes climatiques violents s’intensifient.{' '}
                  <strong className="text-primary-700">
                    Des régions s’assèchent, quand d’autres sont inondées.
                  </strong>
                </Trans>
              </p>

              <p>
                <Trans locale={locale}>
                  Par ailleurs,{' '}
                  <strong className="text-primary-700">
                    l’empreinte humaine sur les sols
                  </strong>{' '}
                  (artificialisation, cultures intensives, déforestation) a
                  réduit fortement leur capacité à absorber et retenir les eaux
                  pluviales. Elle s’évapore trop vite, et n’alimente plus autant
                  les cours d’eau, lacs et nappes phréatiques, qui
                  progressivement s’épuisent.
                </Trans>
              </p>

              <p>
                <Trans locale={locale}>
                  <strong className="text-primary-700">
                    Chaque geste compte
                  </strong>{' '}
                  pour garantir un accès durable à l'eau pour tous.
                </Trans>
              </p>

              <p>
                <Trans locale={locale}>
                  Pour réduire son empreinte eau, il est nécessaire de{' '}
                  <strong className="text-primary-700">
                    changer nos habitudes quotidiennes
                  </strong>
                  .
                </Trans>
              </p>

              <p className="mb-0">
                <Trans locale={locale}>
                  Adopter{' '}
                  <strong className="text-primary-700">
                    une alimentation moins gourmande en eau
                  </strong>
                  , en consommant moins de viande et en privilégiant{' '}
                  <strong className="text-primary-700">
                    les produits locaux et de saison
                  </strong>
                  , a également un impact significatif. Enfin, en évitant{' '}
                  <strong className="text-primary-700">le gaspillage</strong> et
                  en achetant des produits fabriqués de manière durable, on peut
                  contribuer à la préservation des ressources hydriques tout en
                  limitant{' '}
                  <strong className="text-primary-700">
                    notre empreinte environnementale
                  </strong>
                  .
                </Trans>
              </p>
            </>
          ),
        },
      ]}
    />
  )
}
