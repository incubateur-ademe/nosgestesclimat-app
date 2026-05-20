import { findVisibleActionBySlug } from '../repositories/actions.repository.ts'
import type { Action } from '../types/action.ts'

export const getAction = async (slug: string): Promise<Action | null> =>
  findVisibleActionBySlug(slug)
