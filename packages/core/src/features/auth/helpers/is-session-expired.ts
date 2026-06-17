import type { SessionPayload } from '../types/session.ts'

export function isSessionExpired(payload: SessionPayload): boolean {
  return payload.exp < Math.floor(Date.now() / 1000)
}
