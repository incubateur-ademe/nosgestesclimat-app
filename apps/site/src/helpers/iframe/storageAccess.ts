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
    const result = await document.hasStorageAccess()
    // eslint-disable-next-line no-console
    console.log('[NGC Safari Fix] document.hasStorageAccess() →', result)
    return result
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[NGC Safari Fix] document.hasStorageAccess() error', error)
    return false
  }
}

export async function requestStorageAccess(): Promise<void> {
  if (typeof document === 'undefined') return
  // eslint-disable-next-line no-console
  console.log('[NGC Safari Fix] document.requestStorageAccess() called')
  try {
    await document.requestStorageAccess()
    // eslint-disable-next-line no-console
    console.log('[NGC Safari Fix] document.requestStorageAccess() → resolved')
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[NGC Safari Fix] document.requestStorageAccess() error', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : String(error),
    })
    throw error
  }
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
