import type { Simulation } from '@/publicodes-state/types'

export function sanitizeSimulation(simulation: Simulation): Simulation {
  // Strip unrecognized keys before mapping and posting
  const sanitized: Simulation & {
    createdAt?: string
    updatedAt?: string
  } = { ...simulation }
  delete sanitized.createdAt
  delete sanitized.updatedAt
  delete sanitized.user
  delete sanitized.groups
  delete sanitized.polls
  return sanitized
}
