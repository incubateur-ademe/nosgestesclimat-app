'use server'

import { validate } from 'uuid'
import { getAnonSession } from '../dal/anonSession'
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

  const session = await getAnonSession()

  session.userId = userId
  await session.save()
}
