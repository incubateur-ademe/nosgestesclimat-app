import { findActions } from '../repositories/actions.repository.ts'
import type { Action } from '../types/action.ts'

export const getActions = async (): Promise<Action[]> => findActions()
