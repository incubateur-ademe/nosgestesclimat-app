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
    avatarSrc: string
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
  dynamicCounter: {
    currentValue: number
    targetValue: number
    progressPercentage: number
    primaryCtaHref: string
    secondaryCtaHref: string
  }
  statisticsValues: [number, number, number]
  podiumItems: PodiumItem[]
  testimonies: Testimony[]
  tutorialStepsByMode: Record<string, TutorialStep[]>
  ctaImageSrc: string
  ctaHeading: string
  ctaDescription: string
  ctaCards: CtaCard[]
}

/** Event page data — centralized mock content before CMS integration. */
export function getEventPageData(): EventPageData {
  return {
    detailImageSrc:
      'https://nosgestesclimat-prod.s3.fr-par.scw.cloud/cms/journee_de_la_terre_2026_8ead81e894.svg',
    dynamicCounter: {
      currentValue: 18501,
      targetValue: 50000,
      progressPercentage: 46,
      primaryCtaHref: '/',
      secondaryCtaHref: '/',
    },
    statisticsValues: [18540, 56, 352],
    podiumItems: [
      { rank: 1, label: 'Votre organisation ?', score: 0 },
      { rank: 2, label: 'Organisation concurrente', score: 0 },
      { rank: 3, label: 'Organisation concurrente', score: 0 },
      { rank: 4, label: 'Organisation concurrente', score: 0 },
      { rank: 5, label: 'Organisation concurrente', score: 0 },
      { rank: 6, label: 'Organisation concurrente', score: 0 },
      { rank: 7, label: 'Organisation concurrente', score: 0 },
      { rank: 8, label: 'Organisation concurrente', score: 0 },
      { rank: 9, label: 'Organisation concurrente', score: 0 },
      { rank: 10, label: 'Organisation concurrente', score: 0 },
    ],
    testimonies: [
      {
        text: "Nous avons proposé à notre communauté de voyageurs d'utiliser Nos Gestes Climat pour calculer leur empreinte écologique. C'était une manière simple et accessible de sensibiliser sans culpabiliser. Résultat : près de 4 700 participations. Un vrai levier pour initier le dialogue sur un tourisme plus responsable.",
        author: {
          name: 'Elisa Papin',
          job: 'Impact Officer chez HomeExchang',
          avatarSrc:
            'https://nosgestesclimat-prod.s3.fr-par.scw.cloud/cms/petit_logo_006dd01955.png',
        },
      },
      {
        text: "La campagne Nos Gestes Climat a réellement permis de faire vivre le sujet sur l'application pass Culture, mais aussi en interne où près d'un tiers des 170 collaborateurs ont participé. Le format a été réellement apprécié par tous et a permis d'initier des discussions importantes.",
        author: {
          name: 'Théo Gasquet',
          job: 'Responsable des relations avec les publics du Pass Culture',
          avatarSrc:
            'https://nosgestesclimat-prod.s3.fr-par.scw.cloud/cms/petit_logo_006dd01955.png',
        },
      },
      {
        text: "La campagne Nos Gestes Climat a réellement permis de faire vivre le sujet sur l'application pass Culture, mais aussi en interne où près d'un tiers des 170 collaborateurs ont participé. Le format a été réellement apprécié par tous et a permis d'initier des discussions importantes.",
        author: {
          name: 'Théo Gasquet',
          job: 'Responsable des relations avec les publics du Pass Culture',
          avatarSrc:
            'https://nosgestesclimat-prod.s3.fr-par.scw.cloud/cms/petit_logo_006dd01955.png',
        },
      },
    ],
    tutorialStepsByMode: {
      organisation: [
        {
          number: 1,
          title: 'Créez un test collectif',
          description:
            'Configurez votre campagne en quelques clics et définissez vos objectifs.',
        },
        {
          number: 2,
          title: 'Partagez le lien',
          description:
            'Diffusez un lien unique par email, réseau social ou QR code auprès de vos collaborateurs.',
        },
        {
          number: 3,
          title: 'Suivez les résultats',
          description:
            'Visualisez en temps réel les participations et l’empreinte carbone collective.',
        },
      ],
      individu: [
        {
          number: 1,
          title: 'Répondez aux questions',
          description:
            'Parcourez les thématiques (alimentation, transport, logement…) en quelques minutes.',
        },
        {
          number: 2,
          title: 'Résultat instantané',
          description:
            'Découvrez votre empreinte carbone personnelle détaillée par catégorie.',
        },
        {
          number: 3,
          title: "Passez à l'action",
          description:
            'Recevez des actions personnalisées pour réduire votre impact au quotidien.',
        },
      ],
    },
    ctaImageSrc:
      'https://nosgestesclimat-prod.s3.fr-par.scw.cloud/cms/people_raising_arms_v2_dd1c17393a.svg',
    ctaHeading: "Prêt·e à rejoindre l'aventure ?",
    ctaDescription: 'Deux façons de participer au challenge.',
    ctaCards: [
      {
        emoji: '👤',
        alt: 'Individuel',
        title: 'En individuel',
        description:
          'Estimez votre empreinte carbone personnelle et découvrez des actions concrètes pour la réduire.',
        buttonLabel: 'Je participe',
        buttonHref: '#',
      },
      {
        emoji: '🏛️',
        alt: 'Organisation',
        title: 'En organisation',
        description:
          'Créez un test collectif, partagez-le à vos équipes et visualisez les résultats de votre campagne.',
        buttonLabel: 'Je crée un test collectif',
        buttonHref: '#',
      },
    ],
  }
}
