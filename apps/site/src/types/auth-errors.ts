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

export function isCodeError(error: unknown): error is CodeError {
  if (typeof error !== 'object' || error === null) return false
  const tag = (error as Record<string, unknown>)._tag
  return tag === 'invalid' || tag === 'rate_limited' || tag === 'unknown'
}

export type EmailError = { _tag: 'rate_limited' } | { _tag: 'unknown' }
