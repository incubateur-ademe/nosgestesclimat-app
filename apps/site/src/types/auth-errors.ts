export type CodeError =
  | { _tag: 'invalid' }
  | { _tag: 'rate_limited' }
  | { _tag: 'unknown'; message?: string }

export type EmailError = { _tag: 'rate_limited' } | { _tag: 'unknown' }
