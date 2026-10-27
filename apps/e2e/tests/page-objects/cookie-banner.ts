import type { Page } from '@playwright/test'

export class CookieBanner {
  static DISMISS_COOKIE_BANNER = 'cookie-banner-refuse-button'

  constructor(public readonly page: Page) {}

  async dismiss() {
    await this.page.getByTestId(CookieBanner.DISMISS_COOKIE_BANNER).click()
  }
}
