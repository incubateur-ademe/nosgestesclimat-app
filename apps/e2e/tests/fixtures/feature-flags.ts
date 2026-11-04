import { test as base, type Browser, type Page } from '@playwright/test'

import type { DefaultFlagValues } from '@site/services/feature-flags/flags'
import { FF_COOKIE_NAME } from '../constants'
import { patchGetByTestId } from './visible-testid'

const DOMAIN = new URL(process.env.NEXT_PUBLIC_SITE_URL!).hostname

// Type-only import of the site's flag contract (see tsconfig `@site/*`): the
// suite stays black-box at runtime, but a renamed or removed flag now breaks
// `pnpm -F @nosgestesclimat/e2e typecheck`.
export const DEFAULT_FLAGS = {
  'abc-test-layout-catalogue': 'control',
  'abc-test-action-card': 'control',
} satisfies DefaultFlagValues

export class FeatureFlags {
  constructor(private page: Page) {}

  async set(flags: Record<string, string | boolean>) {
    await this.page.context().addCookies([
      {
        name: FF_COOKIE_NAME,
        value: JSON.stringify(flags),
        domain: DOMAIN,
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

  async #read(): Promise<Record<string, string | boolean>> {
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

export async function createPage(browser: Browser): Promise<Page> {
  const page = await browser.newPage()
  patchGetByTestId(page)
  const ff = new FeatureFlags(page)
  await ff.set({ ...DEFAULT_FLAGS })
  return page
}

interface FeatureFlagFixtures {
  featureFlags: FeatureFlags
}

const test = base.extend<FeatureFlagFixtures>({
  featureFlags: [
    async ({ page }, use) => {
      const featureFlags = new FeatureFlags(page)
      await featureFlags.set({ ...DEFAULT_FLAGS })
      await use(featureFlags)
    },
    { auto: true },
  ],
})

export { test }
