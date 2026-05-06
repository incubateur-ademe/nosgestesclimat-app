import type { Action } from '../../types/action.ts'
import {
  food,
  housing,
  misc,
  societalServices,
  transport,
} from '../themes/index.ts'

const buildSampleActions = (
  prefix: string,
  theme: Action['theme'],
  ids: [string, string, string, string, string],
  offset: number
): Action[] =>
  [1, 2, 3, 4, 5].map((index, i) => {
    const mediaIndex = (offset + i) % 3
    const media =
      mediaIndex === 1
        ? {
            type: 'impact_co2' as const,
            title: `Impact CO2 - ${prefix} ${index}`,
            data: {
              type: '/livraison',
            },
          }
        : mediaIndex === 2
          ? {
              type: 'image' as const,
              title: `Illustration - ${prefix} ${index}`,
              src: 'https://images.unsplash.com/photo-1703091238597-e1ec5fead412?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
              alt: `Illustration de ${prefix.toLowerCase()} ${index}`,
            }
          : undefined

    return {
      id: ids[i],
      language: 'fr',
      title: `${prefix} ${index}`,
      theme,
      ruleId: `${theme.key}.action_${index}`,
      longDescription: `### Pourquoi agir sur ${prefix.toLowerCase()} ${index} ?

Cette action contribue a diminuer les emissions associees au theme ${theme.title}. Elle peut etre mise en place progressivement, selon vos contraintes de budget, de temps et d'organisation.

Avec une approche simple et reguliere, vous pouvez obtenir des resultats concrets sans changer tout votre quotidien d'un coup.

#### Ce que cette action peut apporter

- Reduction mesurable de votre empreinte carbone
- Habitudes plus durables dans le temps
- Effet d'entrainement sur votre entourage

#### Plan d'action recommande

1. Evaluer votre situation actuelle
2. Choisir une premiere etape facile a realiser
3. Generaliser la pratique dans votre routine

Points clefs de vigilance: **impact**, *regularite*, <u>priorisation</u> et ~~perfection immediate~~.`,
      means: `- Commencez par une action simple a mettre en oeuvre cette semaine, puis faites un point en fin de semaine pour observer ce qui fonctionne. Voir la methode dans [ce guide pratique](https://agirpourlatransition.ademe.fr/particuliers).

- Definissez un objectif realiste sur 30 jours, avec un indicateur facile a suivre. Un exemple de demarche est propose dans [la boite a outils Nos Gestes Climat](https://nosgestesclimat.fr).

- Impliquez une personne de votre entourage pour maintenir la motivation et partager les apprentissages. Vous pouvez vous inspirer de [ces conseils d'accompagnement au changement](https://librairie.ademe.fr).`,
      incentives: `- Aides locales proposees par certaines collectivites
- Subventions nationales selon votre profil et votre situation
- Accompagnement gratuit par des structures publiques ou associatives`,
      furtherReading: `- [Nos Gestes Climat](https://nosgestesclimat.fr)
- [ADEME - Guides et ressources](https://agirpourlatransition.ademe.fr/particuliers)
- [Service Public - Simulateurs et aides](https://www.service-public.fr)
- [ANIL - Information logement et renovation](https://www.anil.org)`,
      media,
    }
  })

export const actions: Action[] = [
  ...buildSampleActions(
    'Action alimentation',
    food,
    [
      '3472aeb0-8fdd-4b64-9784-7b357ca062f1',
      'a7d5b89f-f0de-4c18-97db-5427f98ab5ff',
      '66f52aa6-0636-4f54-a02f-6596efef4ad0',
      'd8f6cfef-8b3f-48d1-95ea-a823aa59de66',
      'd7e682fa-8f6c-4ff8-ae8b-2010a83d56b8',
    ],
    0
  ),
  ...buildSampleActions(
    'Action transport',
    transport,
    [
      '2f923ea7-8f22-4e2e-a406-c5f6f7c1b356',
      '1fe4c4a2-a95f-4f52-83f5-dd34e7f0a80e',
      'd6ea1f26-38d1-4f8f-966f-d13ca33124f8',
      '2275d66d-97ec-4e60-a8f9-5faecf7d8e95',
      'f522d5f5-d28f-422e-8759-3e9ce6f7ecbf',
    ],
    5
  ),
  ...buildSampleActions(
    'Action services sociétaux',
    societalServices,
    [
      '0f5f3150-e723-482e-9d9b-6190c9f4709a',
      '10e446fa-205f-443d-a0dc-0a8cc53f6fb4',
      'ad58f086-568a-4ff7-8603-66d6ac2c95dd',
      '6f2e6fb8-7f1a-4439-b94e-5a671f8f9a49',
      '8f6ed1a9-08e6-42f7-b3d4-2f4e23a0d45e',
    ],
    10
  ),
  ...buildSampleActions(
    'Action logement',
    housing,
    [
      'f91dbd40-b66b-42fa-9377-f84cebe62e9c',
      'd22b8619-8f39-43f5-8f01-f27af4b9e6a0',
      'fb282178-a7f3-4f31-935c-a96798d16f9c',
      '782031f2-8665-415b-bf95-6734da6203d6',
      '8b7966f9-cb7a-4f35-a5ee-cbf95fdce4d7',
    ],
    15
  ),
  ...buildSampleActions(
    'Action divers',
    misc,
    [
      '511ec095-d5a4-4d3f-9aac-74e17dc06ca7',
      '79d608d8-12da-4a87-bf72-f4b9eccf712a',
      'b34d1abf-6c8f-4cb2-b9e4-f4588d9332b2',
      '40544f34-623f-4f4a-a8fb-c6f6c66ac8cc',
      'bc43076f-8f15-4d84-bdbf-a0473d2eb20f',
    ],
    20
  ),
]
