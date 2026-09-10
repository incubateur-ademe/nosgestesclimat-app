import type { ErrorWithCode } from './errors.ts'

export type Success<Data> = Data extends void
  ? { success: true }
  : { success: true; data: Data }

export type Failure<Err extends ErrorWithCode = ErrorWithCode> = {
  success: false
  error: Err
}

export type Result<Data, Err extends ErrorWithCode = ErrorWithCode> =
  | Success<Data>
  | Failure<Err>

export function success(): { success: true }
export function success<Data>(data: Data): Success<Data>
export function success<Data>(data?: Data) {
  if (arguments.length === 0) {
    return { success: true }
  }
  return { success: true, data }
}

export function failure<Err extends ErrorWithCode>(error: Err): Failure<Err> {
  return { success: false, error }
}
