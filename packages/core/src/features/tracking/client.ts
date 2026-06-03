import { PostHog } from 'posthog-node'
import type { TrackingEvent } from './types/event.ts'

type FeatureFlagValue = string | boolean

// TODO: Split tracking and feature flag
// TODO: Abstract Posthog behind interfaces
class PosthogClient {
  private readonly client: PostHog

  constructor(key: string, host: string, personalApiKey?: string) {
    this.client = new PostHog(key, {
      host,
      featureFlagsPollingInterval: 3_600_000, // 1h
      personalApiKey,
      flushAt: 1,
      flushInterval: 0,
    })
  }

  track(distinctId: string, event: TrackingEvent) {
    this.client.capture({
      distinctId,
      event: event.name,
      properties: event.properties,
    })
  }

  async getFeatureFlag(
    flag: string,
    userId: string
  ): Promise<FeatureFlagValue | undefined> {
    return this.client.getFeatureFlag(flag, userId)
  }

  async shutdown(): Promise<void> {
    return this.client.shutdown()
  }
}

class PosthogClientNoop {
  track() {}

  // eslint-disable-next-line @typescript-eslint/require-await
  async getFeatureFlag(): Promise<FeatureFlagValue | undefined> {
    return true
    // return undefined
  }

  async shutdown(): Promise<void> {}
}

export const posthogClient =
  process.env.NEXT_PUBLIC_POSTHOG_KEY && process.env.NEXT_PUBLIC_POSTHOG_HOST
    ? new PosthogClient(
        process.env.NEXT_PUBLIC_POSTHOG_KEY,
        process.env.NEXT_PUBLIC_POSTHOG_HOST,
        process.env.POSTHOG_PERSONAL_API_KEY ?? undefined
      )
    : new PosthogClientNoop()
