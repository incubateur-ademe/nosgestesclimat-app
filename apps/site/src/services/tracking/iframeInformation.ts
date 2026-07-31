import { getIsIframe } from '@/utils/getIsIframe'

export type IframeInformation =
  | {
      iframe: false
    }
  | {
      iframe: true
      $referrer: string | undefined
      $referring_domain: string | undefined
      // This property is included for backward compatibility with PostHog's property naming conventions used earlier.
      $referringDomain: string | undefined
    }

/**
 * Retrieves information about whether the current page is loaded inside an iframe.
 * If it is, also extracts the referrer URL and referring domain from available sources.
 */
export function getIframeInformation(): IframeInformation {
  const iframe = getIsIframe()

  if (!iframe) {
    return { iframe: false }
  }

  const searchParams = new URLSearchParams(location.search)
  const referrer =
    searchParams.get('integratorUrl') ??
    document.location.ancestorOrigins?.[0] ??
    document.referrer

  let referringDomain
  try {
    const url = new URL(referrer)
    referringDomain = url.hostname
  } catch {
    //
  }
  return {
    iframe: true,
    $referrer: referrer,
    $referring_domain: referringDomain,
    $referringDomain: referringDomain,
  }
}
