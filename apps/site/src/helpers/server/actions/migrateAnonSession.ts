'use server'

import { getUserSession } from '@/services/users/get-user-session'
import { validate } from 'uuid'
import { InvalidInputError } from '../error'

/**
 * One-shot migration: seeds the server session with the client's localStorage
 * userId, in order to keep the simulation associated with the previous userID.
 *
 * This action is meant to be removed once the migration window is over
 * (once every active user has connected, e.g ).
 */
export async function migrateAnonSession(userId: string) {
  if (!validate(userId)) {
    throw new InvalidInputError(`Invalid userId: ${userId} is not a valid UUID`)
  }

  await getUserSession()

  // session.userId = userId
  // await session.save()
}
