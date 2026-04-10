import { PARTNER_KEY } from '@/constants/partners'
import { safeSessionStorage } from '@/utils/browser/safeSessionStorage'
import { isServerSide } from '@/utils/nextjs/isServerSide'

export function getPartnerFromStorage() {
  if (isServerSide()) return undefined

  const partnerObjectString = safeSessionStorage.getItem(PARTNER_KEY)

  return partnerObjectString ? JSON.parse(partnerObjectString) : undefined
}

export function setPartnerInStorage(partnerParams: Record<string, string>) {
  if (isServerSide()) return undefined

  safeSessionStorage.setItem(PARTNER_KEY, JSON.stringify(partnerParams))
}

export function removePartnerFromStorage() {
  if (isServerSide()) return undefined

  safeSessionStorage.removeItem(PARTNER_KEY)
}
