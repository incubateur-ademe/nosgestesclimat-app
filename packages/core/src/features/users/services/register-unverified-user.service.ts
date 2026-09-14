import { randomUUID } from 'node:crypto'
import { createUser } from '../repositories/users.repository.ts'
import type { UnverifiedUser } from '../types/user.ts'

/**
 * Mints the anonymous identity a visitor gets on their first write. Callers
 * are responsible for opening a session on it: nothing else can reach the
 * account afterwards.
 */
export const registerUnverifiedUser = async (): Promise<UnverifiedUser> => {
  const id = randomUUID()
  return createUser({ id })
}
