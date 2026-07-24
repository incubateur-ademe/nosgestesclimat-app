export class InvalidCodeError extends Error {
  readonly _tag = 'invalid'
  constructor(message?: string) {
    super(message ?? 'Code invalide')
    this.name = 'InvalidCodeError'
  }
}

export class RateLimitedError extends Error {
  readonly _tag = 'rate_limited'
  constructor(message?: string) {
    super(message ?? 'Trop de requêtes')
    this.name = 'RateLimitedError'
  }
}

export class UnknownCodeError extends Error {
  readonly _tag = 'unknown'
  constructor(message?: string) {
    super(message ?? 'Erreur inconnue')
    this.name = 'UnknownCodeError'
  }
}

export type CodeError = InvalidCodeError | RateLimitedError | UnknownCodeError

export type EmailError = RateLimitedError | UnknownCodeError

export function matchError<E extends { _tag: string }, R>(
  error: E,
  cases: { [K in E['_tag']]: (error: Extract<E, { _tag: K }>) => R }
): R {
  return (cases as unknown as Record<string, (error: E) => R>)[error._tag](
    error
  )
}
