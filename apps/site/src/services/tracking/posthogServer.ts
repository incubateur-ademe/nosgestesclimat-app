import { PostHog } from 'posthog-node'

type FeatureFlagValue = string | boolean

class PosthogServer {
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

  async getFeatureFlag(
    flag: string,
    userId: string
  ): Promise<FeatureFlagValue | undefined> {
    return await this.client.getFeatureFlag(flag, userId)
  }

  /**
   * Reports an exception to PostHog Error Tracking. `distinctId` is optional:
   * without one the SDK files the error anonymously
   * (`$process_person_profile: false`) rather than inventing a person, which is
   * what a crash outside a request deserves.
   *
   * `properties` lands on the event as is — that is how a server-side error
   * gets the pair the browser SDK sets by itself.
   */
  captureException(
    error: Error,
    distinctId?: string,
    properties?: Record<string, string>
  ): void {
    this.client.captureException(error, distinctId, properties)
  }

  async shutdown(): Promise<void> {
    return await this.client.shutdown()
  }
}

class PosthogServerNoop {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  track() {}

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  captureException() {}

  // eslint-disable-next-line @typescript-eslint/require-await
  async getFeatureFlag(): Promise<FeatureFlagValue | undefined> {
    return true
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  async shutdown(): Promise<void> {}
}

export const posthogClient =
  process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN &&
  process.env.NEXT_PUBLIC_POSTHOG_HOST
    ? new PosthogServer(
        process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN,
        process.env.NEXT_PUBLIC_POSTHOG_HOST,
        process.env.POSTHOG_PERSONAL_API_KEY ?? undefined
      )
    : new PosthogServerNoop()
