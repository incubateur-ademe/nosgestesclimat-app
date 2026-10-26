import { mergeTests } from '@playwright/test'

import { test as base } from '../../fixtures'
import { test as groupTest } from './group'
import { test as optionsTest } from './options'
import { test as organisationTest } from './organisation'
import { test as pageObjectsTest } from './page-objects'
import { test as pollTest } from './polls'
import { test as salairePollTest } from './scolaire-poll'
import { test as staticAssetsTest } from './static-assets'
import { test as userTest } from './user'

export const test = mergeTests(
  base,
  optionsTest,
  staticAssetsTest,
  pageObjectsTest,
  userTest,
  groupTest,
  organisationTest,
  pollTest,
  salairePollTest
)
export { expect } from '@playwright/test'
export type { Locator, Page } from '@playwright/test'
