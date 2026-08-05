/* eslint-disable no-console -- The Next server runtime has no structured logger; console is the server log channel. */

export type LogContext = Record<string, unknown>

const PREFIX = '[auth]'

export const siteLogger = {
  info: (message: string, context: LogContext = {}) =>
    console.info(PREFIX, message, context),
  warn: (message: string, context: LogContext = {}) =>
    console.warn(PREFIX, message, context),
  error: (message: string, context: LogContext = {}) =>
    console.error(PREFIX, message, context),
}
