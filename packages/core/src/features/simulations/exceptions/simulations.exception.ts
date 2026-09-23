import { DomainError } from '../../../lib/errors.ts'

export class InvalidModelString extends DomainError<'invalid_model_string'> {
  public readonly simulationId: string
  public readonly modelString: string

  constructor({
    simulationId,
    modelString,
  }: {
    simulationId: string
    modelString: string
  }) {
    super('invalid_model_string', 'Unparsable model string')
    this.simulationId = simulationId
    this.modelString = modelString
  }
}
