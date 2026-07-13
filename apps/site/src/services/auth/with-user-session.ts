'use server'

import { v4 as randomUUID } from 'uuid'

import { createAppSession } from './create-app-session'
import type { AnonUser, AppUser } from './get-user-session'
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
export async function withUserSession<T>(
  fn: (session: AppUser) => Promise<T>
): Promise<T> {
  const existingSession = await getUserSession()
  const session =
    existingSession ?? ({ id: randomUUID(), isAuth: false } satisfies AnonUser)
  const result = await fn(session)
  if (!existingSession) await createAppSession(session.id)
  return result
}
