import type { CaptureOptions } from 'posthog-js'
import posthog from 'posthog-js'

export interface PosthogEvent {
  eventName: string
  properties?: Record<string, string | number | boolean | null | undefined>
  options?: CaptureOptions
}

export const trackEvent = (args: PosthogEvent) => {
  posthog.capture(args.eventName, { ...args.properties }, args.options)
}
