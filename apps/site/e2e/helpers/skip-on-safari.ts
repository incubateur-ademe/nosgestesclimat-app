import { type Browser, test } from '@playwright/test'

export function skipOnSafari(browser: Browser) {
  if (browser.browserType().name() === 'webkit') {
    // @TODO on safari, this test fails systematically (500 error on a server component POST request)
    // However, we cannot reproduce it in real life (browserstack OK)
    test.skip()
  }
}
