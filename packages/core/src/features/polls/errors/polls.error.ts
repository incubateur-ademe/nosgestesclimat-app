import { DomainError } from '../../../lib/errors.ts'
import type { SimulationNotFoundError } from '../../simulations/errors/simulations.error.ts'

export class PollNotFoundError extends DomainError<'poll_not_found'> {
  constructor() {
    super('poll_not_found', 'Campagne introuvable')
  }
}

export type ParticipateToPollError = PollNotFoundError | SimulationNotFoundError
