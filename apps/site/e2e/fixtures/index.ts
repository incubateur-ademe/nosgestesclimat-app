import { mergeTests } from '@playwright/test'
import { test as cookieBannerTest } from '../fixtures/cookie-banner'
import { test as groupTest } from '../fixtures/groups'
import { test as ngcTest } from '../fixtures/ngc-test'
import { test as organisationTest } from '../fixtures/organisations'
import { test as pollTest } from '../fixtures/polls'

import { test as userAccountTest } from '../fixtures/user-account'

export const test = mergeTests(
  groupTest,
  ngcTest,
  cookieBannerTest,
  organisationTest,
  userAccountTest,
  pollTest
)
export { expect } from '@playwright/test'
