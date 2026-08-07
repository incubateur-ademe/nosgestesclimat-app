import { faker } from '@faker-js/faker'
import type { Page } from '@playwright/test'

import {
  getPlaywrightState,
  savePlaywrightState,
} from '../helpers/save-context'
import { UserMailbox } from '../helpers/user-mailbox'
import { test as base, expect } from './options'

function generateUserData() {
  const firstName = faker.person.firstName()
  const lastName = faker.person.lastName()
  return {
    firstName,
    lastName,
    email: faker.internet.email({
      provider: `${process.env.MAILISK_NAMESPACE!}.mailisk.net`,
      firstName,
      lastName,
    }),
  }
}

interface Data {
  firstName: string
  lastName: string
  email: string
}

export class User {
  public readonly mailbox: UserMailbox
  constructor(
    public readonly page: Page,
    private readonly data: Data = generateUserData()
  ) {
    this.mailbox = new UserMailbox(this.email)
  }

  get fullName() {
    return `${this.data.firstName} ${this.data.lastName}`
  }

  get email() {
    return this.data.email.toLowerCase()
  }

  get firstName() {
    return this.data.firstName
  }

  get lastName() {
    return this.data.lastName
  }

  async fillEmailAndCompleteVerification() {
    const emailInput = this.page.getByTestId('verification-code-email-input')
    await emailInput.scrollIntoViewIfNeeded()
    await emailInput.fill(this.email)
    // `fill()` dispatches a single `input` event; react-hook-form needs a tick
    // to register the value before the form can be submitted. Pressing Enter
    // right away submits an empty email and the code input never appears.
    await this.page.waitForTimeout(500)
    await emailInput.press('Enter')
    // The code input only appears once the server has accepted the email and
    // sent the verification code. On a loaded environment (shared preprod)
    // this round-trip can take well over the default 10s.
    const codeInput = this.page.getByTestId('verification-code-input')
    await expect(codeInput).toBeInViewport({ timeout: 30_000 })
    const code = await this.mailbox.getVerificationCode()
    await codeInput.fill(code)
    await codeInput.press('Enter')
  }

  async saveInContext() {
    await savePlaywrightState(this.page, 'user', this.data)
  }

  static async fromContext(page: Page) {
    const data = await getPlaywrightState<Data>(page, 'user')
    return new User(page, data)
  }
}

interface UserFixtures {
  user: User
}

const test = base.extend<UserFixtures>({
  user: async ({ page }, use) => {
    await use(await User.fromContext(page))
  },
})

export { expect, test }
