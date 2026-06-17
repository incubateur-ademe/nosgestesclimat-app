let cachedKey: Uint8Array | null = null

export function getSessionEncryptionKey(): Uint8Array {
  if (!cachedKey) {
    const key = process.env.SESSION_ENCRYPTION_KEY
    if (!key) throw new Error('SESSION_ENCRYPTION_KEY is not set')
    cachedKey = Buffer.from(key)
  }
  return cachedKey
}
