import { verifyIfIntegratorBypassRights } from './verifyIntegratorBypassRights'

export const getIsAllowedToBypassConsentDataShare = () => {
  if (typeof window === 'undefined') return false

  let windowParentLocation

  try {
    windowParentLocation = window.parent.location
  } catch {
    windowParentLocation = undefined
  }

  const integratorUrl = new URL(
    window.location != windowParentLocation
      ? document.referrer || 'about:blank'
      : document.location.href || 'about:blank'
  ).origin

  return verifyIfIntegratorBypassRights(integratorUrl)
}
