import { expect, type Page } from '@playwright/test'

import { UserMailbox } from '../helpers/user-mailbox'

/** The email + verification code form, shared by the pages that require one. */
export class EmailVerification {
  constructor(public readonly page: Page) {}

  async complete(email: string) {
    const emailInput = this.page.getByTestId('verification-code-email-input')
    await emailInput.scrollIntoViewIfNeeded()
    await emailInput.fill(email)
    await emailInput.press('Enter')
    // The code input only appears once the server has accepted the email and
    // sent the verification code. On a loaded environment (shared preprod)
    // this round-trip can take well over the default 10s.
    const codeInput = this.page.getByTestId('verification-code-input')
    await expect(codeInput).toBeInViewport()
    const code = await new UserMailbox(email).getVerificationCode()
    await codeInput.fill(code)
    await codeInput.press('Enter')
  }
}
