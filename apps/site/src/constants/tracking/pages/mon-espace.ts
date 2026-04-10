type MonEspaceTab = 'results' | 'actions' | 'groups' | 'settings'

// Server-side constants formatted for data-track-event attributes
export const monEspaceTabTrackEventServer = (tab: MonEspaceTab) =>
  `MonEspace|Click Tab|${tab.charAt(0).toUpperCase() + tab.slice(1)}`

export const clickMySpaceNoResultsStartTest =
  'MonEspace|Click passer le test pas de résultats'

export const loginComplete = [
  'trackEvent',
  'Connexion',
  'Verification code validé',
]

export const signupComplete = [
  'trackEvent',
  'Mon Espace - Inscription',
  'Verification code validé',
]
