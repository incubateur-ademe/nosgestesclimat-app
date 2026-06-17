'use server'

import { validate } from 'uuid'
import { InvalidInputError } from '../error'

export async function migrateAnonSession(userId: string) {
  // @tofix: implement JOSE session creation from legacy iron-session/anonymous JWT (refonte auth §4.7, tâche 5)
  if (!validate(userId)) {
    throw new InvalidInputError(`Invalid userId: ${userId} is not a valid UUID`)
  }
}
