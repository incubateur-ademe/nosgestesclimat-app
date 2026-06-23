import { verifyIfIntegratorBypassRights } from './verifyIntegratorBypassRights'

export const getIsAllowedToBypassConsentDataShare = () => {
  if (typeof window === 'undefined') return false

  // 1. Check if integratorUrl is passed as an URL parameter (iframe.js script
  //    or native WebView app). This takes priority.
  const urlIntegratorParam = new URLSearchParams(window.location.search).get(
    'integratorUrl'
  )

  if (urlIntegratorParam) {
    return verifyIfIntegratorBypassRights(new URL(urlIntegratorParam).origin)
  }

  // 2. Fallback for iframes loaded without the integratorUrl parameter:
  //    use document.referrer when in a cross-origin iframe.
  let windowParentLocation

  try {
    windowParentLocation = window.parent.location
  } catch {
    windowParentLocation = undefined
  }

  const integratorOrigin = new URL(
    window.location != windowParentLocation
      ? document.referrer || 'about:blank'
      : document.location.href || 'about:blank'
  ).origin

  return verifyIfIntegratorBypassRights(integratorOrigin)
}
