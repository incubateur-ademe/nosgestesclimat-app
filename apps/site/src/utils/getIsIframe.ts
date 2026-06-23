import { STORAGE_KEYS } from '@/app/[locale]/_components/mainLayoutProviders/iframeOptionsContext/storageKeys'
import { safeSessionStorage } from './browser/safeSessionStorage'

export function getIsIframe(): boolean {
  if (typeof window === 'undefined') return false

  try {
    if (window.self !== window.top) return true
  } catch {
    return true
  }

  // Fallback for environments where window.top === window.self
  // but the page is embedded (e.g. native WebViews)
  return (
    (new URLSearchParams(window.location.search).get('iframe') ||
      safeSessionStorage.getItem(STORAGE_KEYS.IFRAME)) === 'true'
  )
}
