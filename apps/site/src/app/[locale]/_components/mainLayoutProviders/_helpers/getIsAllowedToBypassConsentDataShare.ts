import * as Sentry from '@sentry/nextjs'
import { verifyIfIntegratorBypassRights } from './verifyIntegratorBypassRights'

export const getIsAllowedToBypassConsentDataShare = () => {
  if (typeof window === 'undefined') return false
  // https://stackoverflow.com/questions/6531534/document-location-parent-location-can-they-be-blocked

  const windowLocation = window.location
  const windowParentLocation = window.parent.location

  if (!windowLocation) {
    // eslint-disable-next-line no-console
    console.error('Iframe Nos Gestes Climat: window.location is undefined')
    Sentry.captureMessage(
      `Iframe Nos Gestes Climat: window.location is undefined`
    )
  }

  if (!windowParentLocation) {
    // eslint-disable-next-line no-console
    console.error(
      'Iframe Nos Gestes Climat: window.parent.location is undefined'
    )
    Sentry.captureMessage(
      `Iframe Nos Gestes Climat: window.parent.location is undefined`
    )
  }

  const integratorUrl = new URL(
    window.location != window.parent.location
      ? (document.referrer ?? 'about:blank')
      : (document.location.href ?? 'about:blank')
  ).origin

  return verifyIfIntegratorBypassRights(integratorUrl)
}
