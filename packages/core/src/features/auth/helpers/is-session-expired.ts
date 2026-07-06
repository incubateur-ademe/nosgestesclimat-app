import type { Session } from '../types/session.ts'

export function isSessionExpired(payload: Session): boolean {
  return payload.exp < Math.floor(Date.now() / 1000)
}
