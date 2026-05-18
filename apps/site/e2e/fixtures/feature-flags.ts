import { test as base, type Page } from '@playwright/test'

import { FF_COOKIE_NAME } from '@/services/feature-flags/constants'
import type { FeatureFlagName } from '@/services/feature-flags/flags'

const DEFAULT_FLAGS = {
  'actions-v2': false,
} satisfies Record<FeatureFlagName, boolean>

export class FeatureFlags {
  constructor(private page: Page) {}

  async set(flags: Record<string, boolean>) {
    await this.page.context().addCookies([
      {
        name: FF_COOKIE_NAME,
        value: JSON.stringify(flags),
        path: '/',
        sameSite: 'Lax' as const,
      },
    ])
  }

  async enable(flag: string) {
    await this.set({ ...(await this.#read()), [flag]: true })
  }

  async disable(flag: string) {
    await this.set({ ...(await this.#read()), [flag]: false })
  }

  async #read(): Promise<Record<string, boolean>> {
    const cookies = await this.page.context().cookies()
    const ffCookie = cookies.find((c) => c.name === FF_COOKIE_NAME)
    if (!ffCookie) return {}
    try {
      return JSON.parse(ffCookie.value)
    } catch {
      return {}
    }
  }
}

interface FeatureFlagFixtures {
  featureFlags: FeatureFlags
}

const test = base.extend<FeatureFlagFixtures>({
  featureFlags: async ({ page }, use) => {
    const featureFlags = new FeatureFlags(page)
    await featureFlags.set({ ...DEFAULT_FLAGS })
    await use(featureFlags)
  },
})

export { test }
