import posthog from 'posthog-js'

declare global {
  interface Window {
    _paq: unknown[]
    Matomo: Record<string, unknown>
  }
}

/**
 * @deprecated Use trackPosthogEvent instead, or better, data-track directly in HTML/JSX
 */
export const trackMatomoEvent__deprecated = (args: (string | null)[]) => {
  if (process.env.NODE_ENV === 'development' || !window?._paq) {
    return
  }

  // Matomo: [ 'trackEvent', 'Category', 'Action', 'Name', 'Value' ]
  // Exemple : ['trackEvent', 'Misc', 'Region', 'Region used: FR']
  // Or : ['trackEvent', 'Accueil', 'CTA Click', 'Click Reprendre le test']
  // Or : ['trackEvent', 'Simulation', 'Simulation Completed', null, '8.9']
  // Or : ['trackEvent', 'Simulation', 'Simulation Time', null, '3']
  // Or : ['trackEvent', 'Fin', 'Toggle Target block']

  // Pass a copy of the array to avoid mutation
  window?._paq?.push([...args])
}

export const trackPosthogEvent = (args: {
  eventName: string
  properties?: Record<string, string | number | boolean | null | undefined>
}) => {
  posthog.capture(args.eventName, { ...args.properties })
}
