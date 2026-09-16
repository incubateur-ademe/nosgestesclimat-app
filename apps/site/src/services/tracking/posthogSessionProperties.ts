import posthog, { type Properties } from 'posthog-js'

/**
 * Session super properties registered by the app (locale, region, poll, ...).
 *
 * `posthog.register_for_session()` writes to the SDK *session persistence*
 * (`sessionStorage`), which is disabled while no consent has been given
 * (`cookieless_mode: 'on_reject'`).
 *
 * Trackers mounted before the banner is answered (typically the poll landing
 * page, which is the first page of a session for campaign traffic) would
 * therefore register their properties into the void.
 *
 */
const sessionProperties: Properties = {}

/** Registers session super properties, and remembers them to re-apply on demand. */
export function registerSessionProperties(properties: Properties): void {
  Object.assign(sessionProperties, properties)
  posthog.register_for_session(properties)
}

/** Replays every property registered so far (no-op when there is none). */
export function reapplySessionProperties(): void {
  if (Object.keys(sessionProperties).length === 0) return

  posthog.register_for_session(sessionProperties)
}
