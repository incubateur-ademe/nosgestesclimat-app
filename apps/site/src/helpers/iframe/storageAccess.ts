export function isSafari(): boolean {
  if (typeof navigator === 'undefined') return false
  const userAgent = navigator.userAgent.toLowerCase()
  // Chrome includes safari in its user-agent so we need to filter it
  return userAgent.includes('safari') && !userAgent.includes('chrome')
}

export function supportStorageAccessApi(): boolean {
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

export function isStorageAccessApiSupported(): boolean {
  return isSafari() && supportStorageAccessApi()
}

export async function requiresStoragePermissions(): Promise<boolean> {
  return isStorageAccessApiSupported() && !(await hasStorageAccess())
}
