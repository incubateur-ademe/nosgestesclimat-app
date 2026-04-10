import type { AuthenticationMode } from '@/types/authentication'

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

export const signinTrackEvent = (mode?: AuthenticationMode) => [
  'trackEvent',
  'Authentication',
  'Click Submit Email',
  mode ?? '',
]

export const captureClickTab = ({
  tab,
}: {
  tab: 'connexion' | 'inscription'
}) => {
  return {
    eventName: 'click tab',
    properties: {
      tab,
    },
  }
}

export const tabTrackEvent = (tab: 'connexion' | 'inscription') => [
  'trackEvent',
  'Authentication',
  'Click Tab',
  tab === 'connexion' ? 'Connexion' : 'Inscription',
]

export const clickResendCode = [
  'trackEvent',
  'Authentication',
  'Click Renvoyer le code',
]

export const captureClickResendCode = () => {
  return {
    eventName: 'click resend code',
  }
}
