import { test as base, type Browser, type Page } from '@playwright/test'

import type { DefaultFlagValues } from '@site/services/feature-flags/flags'
import { FeatureFlags } from '../pages/feature-flags'
import { patchGetByTestId } from './visible-testid'

// Type-only import of the site's flag contract (see tsconfig `@site/*`): the
// suite stays black-box at runtime, but a renamed or removed flag now breaks
// `pnpm -F @nosgestesclimat/e2e typecheck`.
export const DEFAULT_FLAGS = {
  'abc-test-layout-catalogue': 'control',
  'abc-test-action-card': 'control',
  'ab-test-global-footprint-display': 'control',
} satisfies DefaultFlagValues

export { FeatureFlags } from '../pages/feature-flags'

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
