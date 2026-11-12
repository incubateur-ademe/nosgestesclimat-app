import type { Page } from '@playwright/test'

export class UserSpace {
  static URL = '/mon-espace'

  constructor(public readonly page: Page) {}

  async goto() {
    await this.page.goto(UserSpace.URL)
  }

  async fromHeader() {
    await this.page.getByTestId('my-space-button').click()
    await this.page.getByTestId('my-space-link').click()
  }
}
