import type { Logger } from '@nosgestesclimat/core/features/logger/index'
import pino from 'pino'

/**
 * Single-line JSON output: a multi-line pretty-printed object gets fragmented
 * by Scalingo's log drain into separate timestamped lines, which then
 * interleave with other concurrent log calls and read as scrambled. Pino
 * always writes one line per log call, so the pretty transport stays opt-in
 * and local-only.
 *
 * Field names (`timestamp`, `level` as a label, `message`, `service`) mirror
 * apps/server's winston setup so both apps read identically in the drain.
 */
const pinoLogger = pino({
  level: process.env.LOG_LEVEL ?? 'info',
  timestamp: pino.stdTimeFunctions.isoTime,
  messageKey: 'message',
  formatters: {
    log: serializeErrors,
  },
  transport:
    process.env.LOG_PRETTY === 'true'
      ? {
          target: 'pino-pretty',
          options: {
            colorize: true,
            messageKey: 'message',
            timestampKey: 'timestamp',
            translateTime: 'HH:MM:ss',
          },
        }
      : undefined,
})

/**
 * Callers pass errors under whichever meta key reads best (`error`, `cause`,
 * ...), so serialize every error rather than a hardcoded list of keys — a raw
 * Error stringifies to `{}`.
 */
function serializeErrors(
  meta: Record<string, unknown>
): Record<string, unknown> {
  const serialized: Record<string, unknown> = {}

  for (const [key, value] of Object.entries(meta)) {
    serialized[key] =
      value instanceof Error ? pino.stdSerializers.errWithCause(value) : value
  }

  return serialized
}

const logger: Logger = {
  error: (message, meta) => pinoLogger.error(meta ?? {}, message),
  warn: (message, meta) => pinoLogger.warn(meta ?? {}, message),
  info: (message, meta) => pinoLogger.info(meta ?? {}, message),
  debug: (message, meta) => pinoLogger.debug(meta ?? {}, message),
}

export default logger

/**
 * Keeps a log line correlatable with a user report without storing the
 * address: `jo***@ex***.com` is enough to match an email a user gives us
 * in support.
 */
export const maskEmail = (email: unknown) => {
  if (typeof email !== 'string') {
    return '[REDACTED]'
  }

  const [local, domain] = email.split('@')

  return domain
    ? `${local.slice(0, 2)}***@${domain.slice(0, 2)}***`
    : '[REDACTED]'
}
