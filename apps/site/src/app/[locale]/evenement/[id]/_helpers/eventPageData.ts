/** Event page data — centralized mock content before CMS integration. */

import {
  ORGANISATION_SIGN_IN_PATH,
  SIMULATOR_PATH,
} from '@/constants/urls/paths'

export interface PodiumItem {
  rank: number
  label: string
  score: number
}

export interface Testimony {
  text: string
  author: {
    name: string
    job: string
    avatarSrc?: string
  }
}

export interface TutorialStep {
  number: number
  title: string
  description: string
}

export interface CtaCard {
  emoji: string
  alt: string
  title: string
  description: string
  buttonLabel: string
  buttonHref: string
}

export interface EventPageData {
  detailImageSrc: string
  startDate: string
  endDate: string
  dynamicCounter: {
    currentValue: number
    targetValue: number
    progressPercentage: number
    primaryCtaHref: string
    secondaryCtaHref: string
  }
  statisticsValues: {
    simulations: number
    actions: number
    organisations: number
  }
  podiumItems: PodiumItem[]
  testimonies: Testimony[]
  tutorialStepsByMode: Record<string, TutorialStep[]>
  ctaImageSrc: string
  ctaHeading: string
  ctaDescription: string
  ctaCards: CtaCard[]
}

export function getEventPageData(
  t: (key: string, defaultValue: string) => string
): EventPageData {
  const currentValue = 0
  const targetValue = 50000

  return {
    detailImageSrc:
      'https://nosgestesclimat-prod.s3.fr-par.scw.cloud/cms/journee_de_la_terre_2026_8ead81e894.svg',
    startDate: '2026-09-01T00:00:00+02:00',
    endDate: '2026-09-30T23:59:59+02:00',
    dynamicCounter: {
      currentValue,
      targetValue,
      progressPercentage:
        targetValue > 0 ? (currentValue / targetValue) * 100 : 0,
      primaryCtaHref: ORGANISATION_SIGN_IN_PATH,
      secondaryCtaHref: '/',
    },
    statisticsValues: {
      simulations: 0,
      actions: 0,
      organisations: 0,
    },
    podiumItems: [
      {
        rank: 1,
        label: t('event.podium.yourOrg', 'Votre organisation ?'),
        score: 0,
      },
      ...Array.from({ length: 9 }, (_, i) => ({
        rank: i + 2,
        label: t('event.podium.competitor', 'Organisation concurrente'),
        score: 0,
      })),
    ],
    testimonies: [
      {
        text: t(
          'event.testimonies.1.text',
          "Nous avons proposé à notre communauté de voyageurs d'utiliser Nos Gestes Climat pour calculer leur empreinte écologique. C'était une manière simple et accessible de sensibiliser sans culpabiliser. Résultat : près de 4 700 participations. Un vrai levier pour initier le dialogue sur un tourisme plus responsable."
        ),
        author: {
          name: 'Elisa Papin',
          job: t(
            'event.testimonies.1.author.job',
            'Impact Officer chez HomeExchange'
          ),
          avatarSrc:
            'https://nosgestesclimat-prod.s3.fr-par.scw.cloud/cms/elisa_papin_big_a21e5928cf.png',
        },
      },
      {
        text: t(
          'event.testimonies.2.text',
          "La campagne Nos Gestes Climat a réellement permis de faire vivre le sujet sur l'application pass Culture, mais aussi en interne où près d'un tiers des 170 collaborateurs ont participé. Le format a été réellement apprécié par tous et a permis d'initier des discussions importantes."
        ),
        author: {
          name: 'Théo Gasquet',
          job: t(
            'event.testimonies.2.author.job',
            'Responsable des relations avec les publics du Pass Culture'
          ),
          avatarSrc:
            'https://nosgestesclimat-prod.s3.fr-par.scw.cloud/cms/theo_gasquet_big_780f9fce63.png',
        },
      },
      {
        text: t(
          'event.testimonies.3.text',
          'À titre privé nous avons fait organiser un petit concours interne avec mes enfants. À titre professionnel, dans le cadre de l’amélioration de notre bilan carbone, nous avons utilisé cet outil afin de sensibiliser nos collaborateurs sur l’impact de leur quotidien.'
        ),
        author: {
          name: 'Jean-Noël Dronneau',
          job: 'Epsii',
        },
      },
      {
        text: t(
          'event.testimonies.4.text',
          "J'ai été surprise de voir que l’essentiel de mon empreinte ne vient pas de mes actions directes comme mes déplacements, mais plutôt de choses plus invisibles au quotidien comme les services publics ou la production des biens que j’achète. Ça m’a fait réaliser que l’impact carbone est souvent indirect."
        ),
        author: {
          name: 'Anonyme',
          job: 'test collectif réalisé par l’organisation Pass Culture',
        },
      },
      {
        text: t(
          'event.testimonies.5.text',
          'J’ai été surprise d’apprendre que notre objectif est de réduire notre empreinte carbone à 2 tonnes de CO₂ par personne et par an d’ici 2050. Je ne pensais pas que l’écart avec notre mode de vie actuel était aussi important.'
        ),
        author: {
          name: 'Anonyme',
          job: 'test collectif réalisé par l’organisation Pass Culture',
        },
      },
    ],
    tutorialStepsByMode: {
      organisation: [
        {
          number: 1,
          title: t('event.tutorial.org.1.title', 'Créez un test collectif'),
          description: t(
            'event.tutorial.org.1.description',
            'Configurez votre campagne en quelques clics et définissez vos objectifs.'
          ),
        },
        {
          number: 2,
          title: t('event.tutorial.org.2.title', 'Partagez le lien'),
          description: t(
            'event.tutorial.org.2.description',
            'Diffusez un lien unique par email, réseau social ou QR code auprès de vos collaborateurs.'
          ),
        },
        {
          number: 3,
          title: t('event.tutorial.org.3.title', 'Suivez les résultats'),
          description: t(
            'event.tutorial.org.3.description',
            'Visualisez en temps réel les participations et l’empreinte carbone collective.'
          ),
        },
      ],
      individu: [
        {
          number: 1,
          title: t(
            'event.tutorial.individual.1.title',
            'Répondez aux questions'
          ),
          description: t(
            'event.tutorial.individual.1.description',
            'Parcourez les thématiques (alimentation, transport, logement…) en quelques minutes.'
          ),
        },
        {
          number: 2,
          title: t('event.tutorial.individual.2.title', 'Résultat instantané'),
          description: t(
            'event.tutorial.individual.2.description',
            'Découvrez votre empreinte carbone personnelle détaillée par catégorie.'
          ),
        },
        {
          number: 3,
          title: t('event.tutorial.individual.3.title', "Passez à l'action"),
          description: t(
            'event.tutorial.individual.3.description',
            'Recevez des actions personnalisées pour réduire votre impact au quotidien.'
          ),
        },
      ],
    },
    ctaImageSrc:
      'https://nosgestesclimat-prod.s3.fr-par.scw.cloud/cms/people_raising_arms_v2_dd1c17393a.svg',
    ctaHeading: t('event.ctas.heading', "Prêt·e à rejoindre l'aventure ?"),
    ctaDescription: t(
      'event.ctas.description',
      'Deux façons de participer au challenge.'
    ),
    ctaCards: [
      {
        emoji: '👤',
        alt: t('event.ctas.card1.alt', 'À titre individuel'),
        title: t('event.ctas.card1.title', 'À titre individuel'),
        description: t(
          'event.ctas.card1.description',
          "Calculez votre empreinte en 10 minutes et découvrez vos leviers d'action personnalisés."
        ),
        buttonLabel: t('event.ctas.card1.buttonLabel', 'Je participe'),
        buttonHref: SIMULATOR_PATH,
      },
      {
        emoji: '🏛️',
        alt: t('event.ctas.card2.alt', 'Avec votre organisation'),
        title: t('event.ctas.card2.title', 'Avec votre organisation'),
        description: t(
          'event.ctas.card2.description',
          'Créez un espace dédié pour mobiliser vos collègues, élèves / étudiants, ou parties prenantes.'
        ),
        buttonLabel: t(
          'event.ctas.card2.buttonLabel',
          'Je crée un test collectif'
        ),
        buttonHref: ORGANISATION_SIGN_IN_PATH,
      },
    ],
  }
}
