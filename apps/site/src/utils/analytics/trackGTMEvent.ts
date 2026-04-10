declare global {
  interface Window {
    dataLayer: Record<string, unknown>[]
    gtag?: (...args: unknown[]) => void
  }
}

export const trackGTMEvent = (event: { event: string }) => {
  if (typeof window === 'undefined' || !window.dataLayer) {
    // eslint-disable-next-line no-console
    console.debug(`GTM Event (not sent - GTM not loaded): ${event.event}`)
    return
  }

  window.dataLayer.push(event)
}
