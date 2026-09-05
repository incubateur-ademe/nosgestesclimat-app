export function invariant(
  condition: unknown,
  message?: string | (() => string)
): asserts condition {
  if (condition) {
    return
  }

  throw new InvariantError(typeof message === 'function' ? message() : message)
}

class InvariantError extends Error {
  constructor(message: string = 'Invariant violation') {
    super(message)
    this.name = this.constructor.name
  }
}
