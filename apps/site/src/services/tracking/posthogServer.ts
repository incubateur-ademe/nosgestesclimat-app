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
    return this.client.getFeatureFlag(flag, userId)
  }

  async shutdown(): Promise<void> {
    return this.client.shutdown()
  }
}

class PosthogServerNoop {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  track() {}

  // eslint-disable-next-line @typescript-eslint/require-await
  async getFeatureFlag(): Promise<FeatureFlagValue | undefined> {
    return true
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  async shutdown(): Promise<void> {}
}

export const posthogClient =
  process.env.NEXT_PUBLIC_POSTHOG_KEY && process.env.NEXT_PUBLIC_POSTHOG_HOST
    ? new PosthogServer(
        process.env.NEXT_PUBLIC_POSTHOG_KEY,
        process.env.NEXT_PUBLIC_POSTHOG_HOST,
        process.env.POSTHOG_PERSONAL_API_KEY ?? undefined
      )
    : new PosthogServerNoop()
