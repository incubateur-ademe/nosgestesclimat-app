import { DomainError } from '../../../lib/errors.ts'
import type { Model } from '../../simulations/types/model.ts'

export class UnsupportedModelError extends DomainError<'unsupported_model'> {
  public readonly model: Model

  constructor(model: Model) {
    super('unsupported_model', 'Unsupported model')
    this.model = model
  }
}
