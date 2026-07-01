import { getIframeInformation } from '@/services/tracking/iframeInformation'
import type { CaptureOptions } from 'posthog-js'
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
  options?: CaptureOptions
}) => {
  const iframeInfo = getIframeInformation()

  const iframeProperties = iframeInfo.iframe
    ? {
        $referrer: iframeInfo.$referrer,
        $referring_domain: iframeInfo.$referring_domain,
      }
    : {}

  // 1. Inject directly into the captured event
  posthog.capture(
    args.eventName,
    { ...args.properties, ...iframeProperties },
    args.options
  )

  // 2. Re-register immédiatement après pour réparer la persistence
  // (save_referrer() vient de l'écraser pendant le capture ci-dessus)
  // Note: this is a workaround for a bug in PostHog where the $referrer and $referring_domain properties are not persisted across events due to the save_referrer() function being called during auto-capture. By re-registering the properties immediately after capturing the event, we ensure that they are available for subsequent events.
  if (iframeInfo.iframe) {
    posthog.register(iframeProperties)
  }
}
