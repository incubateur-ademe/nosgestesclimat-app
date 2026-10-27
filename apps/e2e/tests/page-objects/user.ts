import { faker } from '@faker-js/faker'
import { expect, type Page } from '@playwright/test'

import { TEST_EMAIL_DOMAIN } from '../constants'
import { UserMailbox } from '../helpers/user-mailbox'

function generateUserData() {
  const firstName = faker.person.firstName()
  const lastName = faker.person.lastName()
  return {
    firstName,
    lastName,
    email: faker.internet.email({
      provider: TEST_EMAIL_DOMAIN,
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
    private readonly _data: Data = generateUserData()
  ) {
    this.mailbox = new UserMailbox(this.email)
  }

  get data(): Data {
    return this._data
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
    await emailInput.press('Enter')
    // The code input only appears once the server has accepted the email and
    // sent the verification code. On a loaded environment (shared preprod)
    // this round-trip can take well over the default 10s.
    const codeInput = this.page.getByTestId('verification-code-input')
    await expect(codeInput).toBeInViewport()
    const code = await this.mailbox.getVerificationCode()
    await codeInput.fill(code)
    await codeInput.press('Enter')
  }
}
