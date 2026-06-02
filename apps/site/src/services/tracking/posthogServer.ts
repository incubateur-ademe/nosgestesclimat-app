import { PostHog } from 'posthog-node'

type FeatureFlagValue = string | boolean

interface PosthogServerInterface {
  getFeatureFlag(
    flag: string,
    userId: string
  ): Promise<FeatureFlagValue | undefined>
  shutdown(): Promise<void>
}

class PosthogServer implements PosthogServerInterface {
  private client: PostHog

  constructor(
    posthogKey: string,
    posthogHost: string,
    posthogPersonalApiKey: string
  ) {
    this.client = new PostHog(posthogKey, {
      host: posthogHost,
      featureFlagsPollingInterval: 3_600_000, // 1h
      personalApiKey: posthogPersonalApiKey,
    })
  }

  async getFeatureFlag(flag: string, userId: string) {
    return this.client.getFeatureFlag(flag, userId)
  }

  async shutdown() {
    return this.client.shutdown()
  }
}

class PosthogServerNoop implements PosthogServerInterface {
  // eslint-disable-next-line @typescript-eslint/require-await
  async getFeatureFlag() {
    return undefined
  }

  async shutdown() {
    //
  }
}

export const posthogClient =
  process.env.NEXT_PUBLIC_POSTHOG_KEY &&
  process.env.NEXT_PUBLIC_POSTHOG_HOST &&
  process.env.POSTHOG_PERSONAL_API_KEY
    ? new PosthogServer(
        process.env.NEXT_PUBLIC_POSTHOG_KEY,
        process.env.NEXT_PUBLIC_POSTHOG_HOST,
        process.env.POSTHOG_PERSONAL_API_KEY
      )
    : new PosthogServerNoop()
