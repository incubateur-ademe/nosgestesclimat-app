function getLandingCategory(pathname: string) {
  switch (pathname) {
    case '/empreinte-eau':
      return 'LP eau'
    case '/empreinte-carbone':
      return 'LP carbone'
    case '/':
    default:
      return 'Accueil'
  }
}

// Click CTA
export const getLandingClickCTAStart = (pathname: string, action: string) => [
  'trackEvent',
  getLandingCategory(pathname),
  action,
  'Click Passer le test',
]

export const getLandingClickCTAResume = (pathname: string, action: string) => [
  'trackEvent',
  getLandingCategory(pathname),
  action,
  'Click Reprendre le test',
]

export const getLandingClickCTAResults = (pathname: string, action: string) => [
  'trackEvent',
  getLandingCategory(pathname),
  action,
  'Click Voir les résultats',
]
export const getLandingClickCTARestart = (pathname: string, action: string) => [
  'trackEvent',
  getLandingCategory(pathname),
  action,
  'Click Recommencer',
]

export const getLandingClickCTACreateCollectiveTest = (
  pathname: string,
  action: string
) => [
  'trackEvent',
  getLandingCategory(pathname),
  action,
  'Click Créer un test collectif',
]

// Did you know slider
export const getLandingDidYouKnowSliderValue = (number: number) =>
  `Passer le test écran ${number}`

export const getLandingDidYouKnowSlider = (pathname: string, value: string) => [
  'trackEvent',
  getLandingCategory(pathname),
  'Click bannière le saviez vous',
  value,
]

// Post thumbnail
export const getLandingClickPostThumbnail = (
  pathname: string,
  action: string
) => ['trackEvent', getLandingCategory(pathname), action]

// Model info
export const getLandingClickModelDocumentation = (pathname: string) => [
  'trackEvent',
  getLandingCategory(pathname),
  'Click documentation',
]

// Nouveautés
export const getLandingClickNouveautes = (pathname: string) => [
  'trackEvent',
  getLandingCategory(pathname),
  'Click nouveautés',
]

export const getLandingDidYouKnowSliderPosthog = (
  pathname: string,
  value: string
) => ({
  eventName: 'Click bannière le saviez vous',
  properties: {
    category: getLandingCategory(pathname),
    value,
  },
})
