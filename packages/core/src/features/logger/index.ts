export interface Logger {
  error: (message: string, meta?: Record<string, unknown>) => void
  warn: (message: string, meta?: Record<string, unknown>) => void
  info: (message: string, meta?: Record<string, unknown>) => void
  debug: (message: string, meta?: Record<string, unknown>) => void
}

/**
 * A logger that swallows everything: for a caller that does not want to hear
 * about a step, and for tests.
 */
export const noopLogger: Logger = {
  error: () => {},
  warn: () => {},
  info: () => {},
  debug: () => {},
}

export type CaptureException = (exception: unknown) => void
