const key = process.env.SESSION_ENCRYPTION_KEY
if (!key) throw new Error('SESSION_ENCRYPTION_KEY is not set')

const encryptionKey: Uint8Array = Buffer.from(key, 'base64')

export function getSessionEncryptionKey(): Uint8Array {
  return encryptionKey
}
