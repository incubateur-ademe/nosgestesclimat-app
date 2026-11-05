import { mergeTests } from '@playwright/test'

import { test as base } from '../../fixtures'
import { test as staticAssetsTest } from './static-assets'

export const test = mergeTests(base, staticAssetsTest)
export { expect } from '@playwright/test'
