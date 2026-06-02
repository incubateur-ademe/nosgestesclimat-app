import { findVisiblePersonalizedActionBySlug } from '../repositories/actions.repository.ts'
import type { PersonalizedAction } from '../types/action.ts'

export const getPersonalizedActionDetails = async (
  slug: string,
  userId: string
): Promise<PersonalizedAction | null> =>
  findVisiblePersonalizedActionBySlug(slug, userId)
