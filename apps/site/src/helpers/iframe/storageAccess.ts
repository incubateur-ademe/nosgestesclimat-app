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

const PARENT_TIMEOUT_MS = 5_000

/**
 * Ask the parent document to call requestStorageAccessForOrigin() via postMessage.
 * The parent must listen for the 'NGC_REQUEST_STORAGE_ACCESS' message.
 * Falls back gracefully if the parent doesn't respond.
 */
export function requestAccessViaParent(): Promise<boolean> {
  if (typeof window === 'undefined' || window.parent === window.self) {
    // eslint-disable-next-line no-console
    console.log(
      '[StorageAccess] requestAccessViaParent: not in iframe or no window'
    )
    return Promise.resolve(false)
  }

  // eslint-disable-next-line no-console
  console.log(
    '[StorageAccess] requestAccessViaParent: sending postMessage to parent'
  )

  return new Promise((resolve) => {
    const ourOrigin = window.location.origin

    const handler = (event: MessageEvent) => {
      if (event.data?.type === 'NGC_STORAGE_ACCESS_RESULT') {
        // eslint-disable-next-line no-console
        console.log(
          '[StorageAccess] Parent response received:',
          event.data.success
        )
        window.removeEventListener('message', handler)
        resolve(event.data.success === true)
      }
    }

    window.addEventListener('message', handler)

    window.parent.postMessage(
      { type: 'NGC_REQUEST_STORAGE_ACCESS', origin: ourOrigin },
      '*'
    )

    setTimeout(() => {
      // eslint-disable-next-line no-console
      console.log('[StorageAccess] Parent timeout, resolving false')
      window.removeEventListener('message', handler)
      resolve(false)
    }, PARENT_TIMEOUT_MS)
  })
}

// Only Safari <= v18 needs this
export async function requiresStoragePermissions(): Promise<boolean> {
  return (
    isSafariVersionBeforeOrEgalTo18() &&
    isStorageAccessApiSupported() &&
    !(await hasStorageAccess())
  )
}
