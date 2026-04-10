export class EntityNotFoundException extends Error {
  constructor(message?: string) {
    super(message || 'Entity not found')
  }
}
