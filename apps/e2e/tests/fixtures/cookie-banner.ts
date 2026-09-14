import { test as base, type Page } from '@playwright/test'

export class CookieBanner {
  static DISMISS_COOKIE_BANNER = 'cookie-banner-refuse-button'

  constructor(public readonly page: Page) {}

  async dismiss() {
    await this.page.getByTestId(CookieBanner.DISMISS_COOKIE_BANNER).click()
  }
}

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
