export function isSafari(): boolean {
  if (typeof navigator === 'undefined') return false
  const userAgent = navigator.userAgent.toLowerCase()
  return (
    userAgent.indexOf('safari') !== -1 && userAgent.indexOf('chrome') === -1
  )
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

export function requiresStoragePermissions(): boolean {
  return isSafari() && supportStorageAccessApi()
}
