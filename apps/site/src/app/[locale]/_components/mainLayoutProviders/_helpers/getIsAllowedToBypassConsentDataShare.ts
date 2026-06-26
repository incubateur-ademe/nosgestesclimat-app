import { verifyIfIntegratorBypassRights } from './verifyIntegratorBypassRights'

export const getIsAllowedToBypassConsentDataShare = (): Promise<boolean> => {
  if (typeof window === 'undefined') return Promise.resolve(false)

  const bypasskey =
    new URLSearchParams(window.location.search).get('bypass_key') ?? ''

  return verifyIfIntegratorBypassRights(bypasskey)
}
