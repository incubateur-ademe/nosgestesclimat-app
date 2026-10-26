import { test as base } from '@playwright/test'

import { CookieBanner } from '../pages/cookie-banner'

export { CookieBanner } from '../pages/cookie-banner'

interface CookieBannerFixtures {
  cookieBanner: CookieBanner
}
const test = base.extend<CookieBannerFixtures>({
  cookieBanner: async ({ page }, use) => {
    const cookieBanner = new CookieBanner(page)
    await use(cookieBanner)
  },
})

export { test }
