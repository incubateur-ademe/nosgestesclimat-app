'use server'

import { v4 as randomUUID } from 'uuid'

import { createAppSession } from './create-app-session'
import { getUserSession } from './get-user-session'

/**
 * Garantit un `userId` autour d'une mutation qui appelle l'API Express.
 *
 * - Si une session existe déjà (anonyme ou authentifiée) → réutilise son
 *   `userId`.
 * - Sinon → génère un nouvel `userId`, exécute la mutation (`fn`), puis crée
 *   la session (tokens en base via le core + cookies).
 *
 * Ce service suppose que l'appel à `fn` crée un enregistrement `User` via
 * l'API Express, ce qui satisfait la FK `RefreshToken.userId`.
 */
export async function withUserId<T>(
  fn: (userId: string) => Promise<T>
): Promise<T> {
  const session = await getUserSession()
  if (session) {
    return await fn(session.id)
  }

  const userId = randomUUID()
  const result = await fn(userId)
  await createAppSession(userId)
  return result
}
