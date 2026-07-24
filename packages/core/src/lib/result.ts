export interface Ok<T> {
  readonly success: true
  readonly output: T
}

export interface Err<E> {
  readonly success: false
  readonly error: E
}

export type Result<T, E> = Ok<T> | Err<E>

export function ok<T>(output: T): Ok<T> {
  return { success: true, output }
}

export function err<E>(error: E): Err<E> {
  return { success: false, error }
}
