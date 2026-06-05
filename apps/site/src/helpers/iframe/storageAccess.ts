export function isSafari(): boolean {
  if (typeof navigator === 'undefined') return false
  const userAgent = navigator.userAgent.toLowerCase()
  // Chrome includes safari in its user-agent so we need to filter it
  return userAgent.includes('safari') && !userAgent.includes('chrome')
}

export function isSafariVersionBeforeOrEgalTo18(): boolean {
  if (typeof navigator === 'undefined') return false
  const match = /Version\/(\d+)\.(\d+)/i.exec(navigator.userAgent)
  if (!match) return false
  const major = parseInt(match[1], 10)

  return isSafari() && major <= 18
}

export function isStorageAccessApiSupported(): boolean {
  if (typeof document === 'undefined') return false
  return 'hasStorageAccess' in document && 'requestStorageAccess' in document
}

export async function hasStorageAccess(): Promise<boolean> {
  if (typeof document === 'undefined') return false
  try {
    return await document.hasStorageAccess()
  } catch {
    return false
  }
}

export async function requestStorageAccess(): Promise<void> {
  if (typeof document === 'undefined') return
  await document.requestStorageAccess()
}

// Only Safari <= v18 needs this
export async function requiresStoragePermissions(): Promise<boolean> {
  return (
    isSafariVersionBeforeOrEgalTo18() &&
    isStorageAccessApiSupported() &&
    !(await hasStorageAccess())
  )
}
