import Trans from '@/components/translation/trans/TransClient'

export default function PersonaExplanations() {
  return (
    <div className="mt-8">
      <details className="pb-4">
        <summary
          role="button"
          tabIndex={0}
          aria-expanded="false"
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              const details = e.currentTarget
                .parentElement as HTMLDetailsElement
              details.open = !details.open
            }
          }}>
          <h2 className="inline">
            <Trans>Qui sont-ils ?</Trans>
          </h2>
          <span className="sr-only">
            Cliquez pour afficher la description des personas
          </span>
        </summary>

        <div className="mt-4">
          <Trans i18nKey={'publicodes.Personas.description'}>
            Nous les avons définis pour qu’ils représentent la diversité des cas
            d’usage du calculateur.
            <i>
              Toute ressemblance avec une personne existant ou ayant existé
              serait purement fortuite !
            </i>
            En aucune mesure, on ne peut dire qu’ils sont représentatifs de la
            distribution de la population française : il ne s’agit pas de coller
            aux statistiques de la population, mais de retrouver parmi nos dix
            personas au moins un qui représente chaque usage majeur et
            différenciant pour le calculateur. Ainsi, nous avons fait varier
            pour chacun d’entre eux :
            <ul className="list-disc pl-4">
              <li>
                Leur genre : même s’il n’influe pas sur l’empreinte, il serait
                étonnant de n’avoir que des personas “femmes”
              </li>

              <li>
                Leur âge et situation personnelle / professionnelle : au moins
                un étudiant, un retraité, un adulte au foyer, un actif
              </li>

              <li>
                La taille de leur foyer : de 1 personne à famille nombreuse
              </li>

              <li>
                Leur lieu de vie : de l’urbain, du rural et du péri-urbain, dans
                le nord, dans le sud, les plaines, la montagne et sur une île
              </li>

              <li>
                Leur logement : de l’appartement à la maison, du neuf à l’ancien
              </li>

              <li>
                Leurs modes de transport : de la marche à la voiture en passant
                par le ferry et l’avion
              </li>

              <li>
                Leur régime alimentaire : au moins un végétalien, un végétarien,
                une personne ne mangeant que du poisson, et un amateur de viande
                rouge
              </li>

              <li>
                Leur tendance à l’achat : du tout occasion au tout neuf, de
                l’acheteur compulsif à celui ou celle qui n’achète presque rien
              </li>

              <li>
                Leur façon de partir en vacances : mode de transport,
                hébergement, on trouve de tout
              </li>

              <li>Leurs loisirs : de la culture, du sport, du bien-être…</li>
            </ul>
          </Trans>
        </div>
      </details>

      <details>
        <summary
          role="button"
          tabIndex={0}
          aria-expanded="false"
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              const details = e.currentTarget
                .parentElement as HTMLDetailsElement
              details.open = !details.open
            }
          }}>
          <h2 className="inline">
            <Trans>Comment les mettons-nous à jour ?</Trans>
          </h2>
          <span className="sr-only">
            Cliquez pour afficher les informations sur la mise à jour des
            personas
          </span>
        </summary>

        <div className="mt-4">
          <Trans i18nKey={'publicodes.Personas.maj'}>
            Pour qu’ils ou elles continuent de représenter la diversité des cas
            d’usage du calculateur d’empreinte carbone, nous les éditons à
            chaque ajout ou modification de ce dernier, en respectant les règles
            suivantes :
            <ul className="list-disc pl-4">
              <li>
                Chaque réponse possible est attribuée à au moins un persona
              </li>

              <li>
                Au moins un persona ne répond rien à la question (il lui est
                donc attribué la valeur par défaut donnée dans le calculateur).
              </li>
            </ul>
          </Trans>
        </div>
      </details>
    </div>
  )
}
