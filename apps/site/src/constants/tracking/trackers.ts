import type { Locale } from '@/i18nConfig'
import type { CookieState } from '@/services/tracking/cookieStateStore'
import type { AuthenticationMode } from '@/types/authentication'
import type { DottedName, NodeValue } from '@incubateur-ademe/nosgestesclimat'
import type { Theme } from '@nosgestesclimat/core/features/actions/types/theme'
interface PosthogProps {
  question?: DottedName | null
  label?: string
  answer?: NodeValue | string
  timeSpentOnQuestion?: number
  timeSpentOnSimulation?: number
  bilanCarbone?: number
  bilanEau?: number
  actionType?: 'précédent' | 'suivant' | 'passer'
  state?: 'opened' | 'closed'
  locale?: string //should be Locale
  category?: string
  status?: 'authenticated' | 'unauthenticated'
  cookieState?: CookieState
}

// Form

export const captureClickFormNav = ({
  question,
  answer,
  timeSpentOnQuestion,
  actionType,
}: PosthogProps) => {
  return {
    eventName: 'click form nav',
    properties: {
      actionType,
      question,
      answer,
      timeSpentOnQuestion,
    },
  }
}

export const captureClickSuggestion = ({
  question,
  answer,
  label,
}: PosthogProps) => {
  return {
    eventName: 'click form suggestion',
    properties: {
      question,
      answer: answer,
      suggestion: label,
    },
  }
}

export const captureClickInfo = ({ question, state }: PosthogProps) => {
  return {
    eventName: 'click form info',
    properties: {
      question,
      state,
    },
  }
}
export const captureSubQuestion = ({ question, state }: PosthogProps) => {
  return {
    eventName: 'click form sub-question',
    properties: {
      question,
      state,
    },
  }
}

export const captureSimulationFirstQuestionSeen = ({
  question,
}: PosthogProps) => {
  return {
    eventName: 'simulation first question seen',
    properties: {
      question,
    },
  }
}

export const captureSimulationStarted = ({ question }: PosthogProps) => {
  return {
    eventName: 'simulation started',
    properties: {
      question,
    },
  }
}

export const captureSimulationCompleted = ({
  bilanCarbone,
  bilanEau,
  timeSpentOnSimulation,
}: PosthogProps) => {
  return {
    eventName: 'simulation completed',
    properties: {
      bilanCarbone,
      bilanEau,
      timeSpentOnSimulation,
    },
  }
}

// Orga

export const captureClickFunFactsPlus = {
  eventName: 'click poll fun facts plus',
}

export const captureDownloadFunFactsPlus = {
  eventName: 'download poll fun facts plus',
}

export const captureDownloadPollQRCode = {
  eventName: 'download poll QR code',
}

export const captureExportPollData = {
  eventName: 'export poll data',
}

// Footer

export const captureClickLanguage = ({
  locale,
}: PosthogProps): {
  eventName: string
  properties: {
    locale: Locale
  }
} => ({
  eventName: 'Header click change language ',
  properties: {
    locale: locale as Locale,
  },
})

// Compte U

export const captureLoginComplete = {
  eventName: 'Connexion - Verification code validé',
}

export const captureSignupComplete = {
  eventName: 'Mon Espace - Inscription - Verification code validé',
}

export const captureAmisCreationConnexionComplete = {
  eventName: 'Amis Creation - Verification code validé',
}

export const captureOrganisationsLoginComplete = {
  eventName: 'Organisations Login - Verification code validé',
}

export const captureClickSubmitEmail = ({
  mode,
}: {
  mode?: AuthenticationMode
}) => {
  return {
    eventName: 'click submit email',
    properties: {
      mode,
    },
  }
}

// User Account

export const captureClickHeaderMonEspace = ({
  status,
  state,
}: PosthogProps) => ({
  eventName: 'click header mon espace',
  properties: {
    status,
    state,
  },
})

export const captureClickShareSimulationButton = {
  eventName: 'click share simulation button',
}

// Cookies

export const captureCookieBannerStatus = ({ cookieState }: PosthogProps) => ({
  eventName: 'Cookie banner status',
  properties: {
    posthogCookie: cookieState?.posthog,
    googleTagCookie: cookieState?.googleTag,
  },
})

// Actions
export const captureActionAddedToPlan = ({
  actionTitle,
  actionTheme,
  impactInKg,
}: {
  actionTitle: string
  actionTheme: Pick<
    Theme,
    'id' | 'key' | 'slug' | 'trackingId' | 'title' | 'emoji'
  >
  impactInKg?: number
}) => ({
  eventName: 'action added to plan',
  properties: {
    action_title: actionTitle,
    action_theme: actionTheme,
    co2_potential_kg: impactInKg,
  },
})
