'use client'

import Trans from '@/components/translation/trans/TransClient'
import {
  tutorielClickFaq,
  tutorielClickQuestion,
} from '@/constants/tracking/pages/tutoriel'
import ButtonLink from '@/design-system/buttons/ButtonLink'
import { trackMatomoEvent__deprecated } from '@/utils/analytics/trackEvent'
import Image from 'next/image'
import OrganisationPrivacy from './autresQuestions/OrganisationPrivacy'

export default function AutresQuestions() {
  return (
    <div className="order-last mb-8 md:order-none">
      <h2 className="mb-2 text-lg">
        <Trans>D'autres questions ?</Trans>
      </h2>
      <ul className="mb-1 list-none p-0">
        <OrganisationPrivacy />
        <li className="mb-2" id={'empreinte'}>
          <details>
            <summary
              className="text-primary-700 cursor-pointer text-sm font-bold md:text-lg"
              role="button"
              tabIndex={0}
              aria-expanded="false"
              onClick={() =>
                trackMatomoEvent__deprecated(
                  tutorielClickQuestion("C'est quoi mon empreinte carbone ?")
                )
              }
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  const details = e.currentTarget
                    .parentElement as HTMLDetailsElement
                  details.open = !details.open
                  trackMatomoEvent__deprecated(
                    tutorielClickQuestion("C'est quoi mon empreinte carbone ?")
                  )
                }
              }}>
              <Trans>C'est quoi mon empreinte carbone ?</Trans>
              <span className="sr-only">Cliquez pour afficher la réponse</span>
            </summary>
            <div className="my-2 ml-3.5 text-sm">
              <p>
                <Trans i18nKey={'publicodes.Tutoriel.slide1.p1'}>
                  Le climat se réchauffe à cause des activités humaines, c'est
                  un fait. Tout ce que nous consommons, utilisons, puis jetons a
                  nécessité de la matière et de l'énergie. Que ce soit pour la
                  phase de production, d'utilisation, ou de fin de vie du bien,
                  ou du service. Ainsi, toutes nos activités participent à
                  émettre des gaz à effet de serre. Certaines énormément,
                  d'autres très peu. Mais quel est notre impact, à notre échelle
                  de citoyen ?
                </Trans>
              </p>
              <Image
                src="https://nosgestesclimat-prod.s3.fr-par.scw.cloud/cms/greenhouse_effect_5fc8193750.svg"
                alt="Effet de serre"
                className="mx-auto w-1/3"
                width={100}
                height={100}
              />
              <p className="text-sm">
                <Trans i18nKey={'publicodes.Tutoriel.slide1.p2'}>
                  Pour estimer sa propre contribution au réchauffement de la
                  planète (son "impact climat"), il est d'usage de calculer ce
                  qu'on appelle l'empreinte carbone individuelle de
                  consommation.
                </Trans>
              </p>
            </div>
          </details>
        </li>
        <li className="mb-2" id={'mesure'}>
          <details>
            <summary
              className="text-primary-700 cursor-pointer text-sm font-bold md:text-lg"
              role="button"
              tabIndex={0}
              aria-expanded="false"
              onClick={() =>
                trackMatomoEvent__deprecated(
                  tutorielClickQuestion('Comment on la mesure ?')
                )
              }
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  const details = e.currentTarget
                    .parentElement as HTMLDetailsElement
                  details.open = !details.open
                  trackMatomoEvent__deprecated(
                    tutorielClickQuestion('Comment on la mesure ?')
                  )
                }
              }}>
              <Trans>Comment on la mesure ?</Trans>
              <span className="sr-only">Cliquez pour afficher la réponse</span>
            </summary>
            <div className="my-2 ml-3.5 text-sm">
              <p>
                <Trans i18nKey={'publicodes.Tutoriel.slide2.p1'}>
                  Avec une unité au nom barbare : l'équivalent CO₂. Le dioxyde
                  de carbone{' '}
                  <Image
                    src="https://nosgestesclimat-prod.s3.fr-par.scw.cloud/cms/co2_acd306ef6d.svg"
                    alt="CO₂"
                    className="inline-block w-8"
                    width={100}
                    height={100}
                  />
                  , vous le connaissez : on l'expire toute la journée, mais sans
                  influence sur le climat.
                </Trans>
              </p>
              <Image
                src="https://nosgestesclimat-prod.s3.fr-par.scw.cloud/cms/co2e_dab11345cd.svg"
                alt="CO₂e"
                className="mx-auto mb-2 w-24"
                width={100}
                height={100}
              />
              <p>
                <Trans i18nKey={'publicodes.Tutoriel.slide2.p2'}>
                  Ce sont les machines qui font notre confort moderne qui en
                  rejettent massivement, à tel point qu'on le compte en milliers
                  de kilos par an et par personne, donc en{' '}
                  <strong>tonnes</strong> de CO₂e !
                </Trans>
              </p>
              <blockquote>
                <details className="text-sm">
                  <summary
                    role="button"
                    tabIndex={0}
                    aria-expanded="false"
                    onClick={() =>
                      trackMatomoEvent__deprecated(
                        tutorielClickQuestion('Mais que veut dire ce petit e ?')
                      )
                    }
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        const details = e.currentTarget
                          .parentElement as HTMLDetailsElement
                        details.open = !details.open
                        trackMatomoEvent__deprecated(
                          tutorielClickQuestion(
                            'Mais que veut dire ce petit e ?'
                          )
                        )
                      }
                    }}>
                    <Trans i18nKey={'sites.publicodes.Tutorial.questionE'}>
                      💡 Mais que veut dire ce petit <em>e</em> ?
                    </Trans>
                    <span className="sr-only">
                      Cliquez pour afficher la réponse
                    </span>
                  </summary>{' '}
                  <Trans i18nKey={'publicodes.Tutoriel.slide2.blockquote'}>
                    D'autres gaz, surtout le méthane{' '}
                    <Image
                      src="https://nosgestesclimat-prod.s3.fr-par.scw.cloud/cms/methane_dcd07779af.svg"
                      alt="methane"
                      className="inline-block w-8"
                      width={100}
                      height={100}
                    />{' '}
                    et le protoxyde d'azote{' '}
                    <Image
                      src="https://nosgestesclimat-prod.s3.fr-par.scw.cloud/cms/n2o_33197c87d4.svg"
                      alt="N2O"
                      className="inline-block w-8"
                      width={100}
                      height={100}
                    />{' '}
                    réchauffent aussi la planète : on convertit leur potentiel
                    de réchauffement en CO₂e pour simplifier la mesure.{' '}
                  </Trans>
                </details>
              </blockquote>
            </div>
          </details>
        </li>
        <li className="mb-2" id={'categories'}>
          <details id={'categories'} className="text-sm">
            <summary
              className="text-primary-700 cursor-pointer text-sm font-bold md:text-lg"
              role="button"
              tabIndex={0}
              aria-expanded="false"
              onClick={() =>
                trackMatomoEvent__deprecated(
                  tutorielClickQuestion("D'où vient mon empreinte ?")
                )
              }
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  const details = e.currentTarget
                    .parentElement as HTMLDetailsElement
                  details.open = !details.open
                  trackMatomoEvent__deprecated(
                    tutorielClickQuestion("D'où vient mon empreinte ?")
                  )
                }
              }}>
              <Trans>D'où vient mon empreinte ?</Trans>
              <span className="sr-only">Cliquez pour afficher la réponse</span>
            </summary>
            <div className="my-2 ml-3.5">
              <Trans i18nKey={'publicodes.Tutoriel.slide6'}>
                <p>
                  Prendre la voiture, manger un steak, chauffer sa maison, se
                  faire soigner, acheter une TV...
                </p>

                <p>
                  L'empreinte de notre consommation individuelle, c'est la somme
                  de toutes ces activités qui font notre vie moderne.
                </p>
              </Trans>
            </div>
          </details>
        </li>
        <li className="mb-4" id={'eau'}>
          <details id={'eau'} className="text-sm">
            <summary
              className="text-primary-700 cursor-pointer text-sm font-bold md:text-lg"
              role="button"
              tabIndex={0}
              aria-expanded="false"
              onClick={() =>
                trackMatomoEvent__deprecated(
                  tutorielClickQuestion("D'où vient mon empreinte ?")
                )
              }
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  const details = e.currentTarget
                    .parentElement as HTMLDetailsElement
                  details.open = !details.open
                  trackMatomoEvent__deprecated(
                    tutorielClickQuestion("D'où vient mon empreinte ?")
                  )
                }
              }}>
              <Trans>Pourquoi avons-nous ajouté l'empreinte eau ?</Trans>
              <span className="sr-only">Cliquez pour afficher la réponse</span>
            </summary>
            <div className="my-2 ml-3.5">
              <p>
                <Trans>
                  L’eau est une ressource planétaire précieuse. Comme le climat,{' '}
                  <strong className="text-secondary-700">
                    le cycle de l’eau est fortement impacté par les activités
                    humaines.
                  </strong>{' '}
                  Nous avons fait le choix d’ajouter l'empreinte eau à notre
                  modèle de calcul afin de vous apporter des éléments de
                  compréhension de cet impact.
                </Trans>
              </p>
            </div>
          </details>
        </li>
      </ul>
      <ButtonLink
        href="/questions-frequentes"
        size="sm"
        color="text"
        className="px-0 underline"
        trackingEvent={tutorielClickFaq}>
        <Trans>Consultez la FAQ</Trans>
      </ButtonLink>
    </div>
  )
}
