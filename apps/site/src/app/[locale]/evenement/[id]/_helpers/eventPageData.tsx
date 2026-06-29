/** Event page data — centralized mock content before CMS integration. */

import Trans from '@/components/translation/trans/TransServer'
import { ORGANISATION_HOME_PAGE } from '@/constants/urls/paths'
import type { Locale } from '@/i18nConfig'
import type { ReactNode } from 'react'

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
  description: string | ReactNode
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

export function getEventPageData({
  t,
  locale,
}: {
  t: (key: string, defaultValue: string) => string
  locale: Locale
}): EventPageData {
  const currentValue = 0
  const targetValue = 50000

  return {
    detailImageSrc:
      'https://nosgestesclimat-prod.s3.fr-par.scw.cloud/cms/VIGNETTE_SEDD_f711b1d37b.svg',
    startDate: '2026-09-01T00:00:00+02:00',
    endDate: '2026-09-30T23:59:59+02:00',
    dynamicCounter: {
      currentValue,
      targetValue,
      progressPercentage:
        targetValue > 0 ? (currentValue / targetValue) * 100 : 0,
      primaryCtaHref: ORGANISATION_HOME_PAGE,
      secondaryCtaHref:
        'https://nosgestesclimat.fr/o/ademe-sedd/sedd-2026-1?utm_medium=sharelink&utm_source=NGC',
    },
    statisticsValues: {
      simulations: 0,
      actions: 0,
      organisations: 0,
    },
    podiumItems: [
      {
        rank: 1,
        label: t('event.podium.yourOrg', 'Organisation 1'),
        score: 0,
      },
      ...Array.from({ length: 9 }, (_, index) => ({
        rank: index + 2,
        label: t(
          `event.podium.competitor${index + 2}`,
          `Organisation ${index + 2}`
        ),
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
          job: t(
            'event.testimonies.4.author.job',
            'Test collectif réalisé par l’organisation Pass Culture'
          ),
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
          description: (
            <Trans locale={locale} i18nKey="event.tutorial.org.2.description">
              Diffusez un lien unique par email, réseau social ou QR code auprès
              de vos collaborateurs.
              <br />
              Aidez-vous de notre{' '}
              <a
                className="text-primary-700 font-medium underline"
                target="_blank"
                rel="noopener noreferrer"
                href="https://accelerateur-transition-ecologique-ademe.notion.site/18-septembre-au-8-octobre-2026-Semaine-europ-enne-du-d-veloppement-durable-Contenu-en-cours-de--2b26523d57d7801fbd4ccdeb887a0a5f">
                kit de communication !
              </a>
            </Trans>
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
      'https://nosgestesclimat-prod.s3.fr-par.scw.cloud/cms/ILLUSTRATION_SEDD_e1a82fa2e2.svg',
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
        buttonHref:
          'https://nosgestesclimat.fr/o/ademe-sedd/sedd-2026-1?utm_medium=sharelink&utm_source=NGC',
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
        buttonHref: ORGANISATION_HOME_PAGE,
      },
    ],
  }
}
