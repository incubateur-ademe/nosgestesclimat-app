import { randomBytes } from 'node:crypto'

/** A 256-bit key, base64url so it survives a cookie value unchanged. */
export function generateRefreshToken(): string {
  return randomBytes(32).toString('base64url')
}
