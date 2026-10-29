import { mergeTests } from '@playwright/test'
import { test as fakerSeedTest } from './faker-seed'
import { test as featureFlagsTest } from './feature-flags'
import { test as hydrationGuardTest } from './hydration-guard'
import { test as visibleTestIdTest } from './visible-testid'

export const test = mergeTests(
  fakerSeedTest,
  hydrationGuardTest,
  visibleTestIdTest,
  featureFlagsTest
)
export { expect } from '@playwright/test'
export type { Locator, Page } from '@playwright/test'
export { createPage, DEFAULT_FLAGS } from './feature-flags'
