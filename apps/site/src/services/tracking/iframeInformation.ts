type IframeInformation =
  | {
      iframe: false
    }
  | {
      iframe: true
      $referrer: string | undefined
      $referringDomain: string | undefined
    }

/**
 * Retrieves information about whether the current page is loaded inside an iframe.
 * If it is, also extracts the referrer URL and referring domain from available sources.
 */
export function getIframeInformation(): IframeInformation {
  const searchParams = new URLSearchParams(location.search)
  const iframe =
    // 1. Standard method
    window.self !== window.top ||
    // 2. Fallback to iframe=true query param
    searchParams.get('iframe') === 'true'

  if (!iframe) {
    return { iframe: false }
  }

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
    iframe,
    $referrer: referrer,
    $referringDomain: referringDomain,
  }
}
