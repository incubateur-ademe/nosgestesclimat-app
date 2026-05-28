export function isSafari(): boolean {
  if (typeof navigator === 'undefined') return false
  const userAgent = navigator.userAgent.toLowerCase()
  return (
    userAgent.indexOf('safari') !== -1 && userAgent.indexOf('chrome') === -1
  )
}

export function supportStorageAccessApi(): boolean {
  return 'hasStorageAccess' in document && 'requestStorageAccess' in document
}

export async function hasStorageAccess(): Promise<boolean> {
  return document.hasStorageAccess()
}

export async function requestStorageAccess(): Promise<void> {
  return document.requestStorageAccess()
}

export function requiresStoragePermissions(): boolean {
  const safari = isSafari()
  const api = supportStorageAccessApi()
  console.log('[NGC Safari Fix]', {
    safari,
    storageAccessApi: api,
    ua: navigator.userAgent,
  })
  return safari && api
}
