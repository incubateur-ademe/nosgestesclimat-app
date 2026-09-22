/**
 * Normalizes a caught value into an `Error`, which `error()`/`fatal()` require.
 * A rejected non-Error (string, plain object) has no stack to report; it is
 * kept as `cause` so the original value is not lost.
 */
export function toError(value: unknown): Error {
  if (value instanceof Error) {
    return value
  }

  return new Error(
    typeof value === 'string' ? value : `Non-error value thrown: ${String(value)}`,
    { cause: value }
  )
}
