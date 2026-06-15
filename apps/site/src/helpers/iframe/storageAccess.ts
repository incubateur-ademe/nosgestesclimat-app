export function isSafari(): boolean {
  if (typeof navigator === 'undefined') return false
  const userAgent = navigator.userAgent.toLowerCase()
  // Chrome includes safari in its user-agent so we need to filter it
  return userAgent.includes('safari') && !userAgent.includes('chrome')
}

export function isSafariMajorVersion(): number | null {
  if (typeof navigator === 'undefined') return null
  const match = /Version\/(\d+)\.(\d+)/i.exec(navigator.userAgent)
  if (!match) return null
  return parseInt(match[1], 10)
}

/**
 * Safari ≤ 16 blocks third-party cookies and requires requestStorageAccess().
 * Safari 17+ supports partitioned cookies (CHIPS) so the overlay is unnecessary.
 */
function requiresStorageAccessPrompt(): boolean {
  if (!isSafari()) return false
  const major = isSafariMajorVersion()
  return major !== null && major <= 16
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

/**
 * Returns true when the browser needs the Storage Access API prompt.
 *
 * Only Safari ≤ 16 requires this — Safari 17+ supports partitioned cookies
 * (CHIPS) and the app sets cookies with `partitioned: true`.
 */
export async function requiresStoragePermissions(): Promise<boolean> {
  return (
    requiresStorageAccessPrompt() &&
    isStorageAccessApiSupported() &&
    !(await hasStorageAccess())
  )
}
