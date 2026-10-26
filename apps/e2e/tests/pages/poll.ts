import { faker } from '@faker-js/faker'
import { TemplateIds } from '@nosgestesclimat/core/features/emails/email.constant'
import { expect, type Page } from '@playwright/test'

import { copyAndReadClipboard } from '../helpers/clipboard'
import type { Organisation } from './organisation'

interface Data {
  name: string
  slug?: string
  inviteLink?: string
}

export class Poll {
  constructor(
    public readonly page: Page,
    private organisation: Organisation,
    private _data: Data = {
      name: `${faker.company.buzzAdjective()} ${faker.company.buzzNoun()}`,
    }
  ) {}

  get data(): Data {
    return this._data
  }

  get name() {
    return this.data.name
  }

  get url() {
    return `${this.organisation.url}/campagnes/${this.data.slug}`
  }

  get inviteLink() {
    return this.data.inviteLink!
  }

  get createUrl() {
    return `${this.organisation.url}/creer-campagne`
  }

  async goto() {
    await this.page.goto(this.url)
  }

  async create() {
    // Fill poll name and submit
    await expect(this.page).toHaveURL(this.createUrl)
    // Clear first to avoid any default value from a previous poll's draft
    // (the input is pre-filled from a previous draft via react-hook-form)
    await this.page.getByTestId('poll-input').clear()
    await this.page.getByTestId('poll-input').fill(this.name)
    await this.page.getByTestId('poll-form-button').click()

    // Retrieve the poll slug (allow more time for the API call)
    const pollUrl = /\/campagnes\/([a-z0-9-]+)/
    await expect(this.page).toHaveURL(pollUrl)
    this.data.slug = pollUrl.exec(this.page.url())![1]
  }

  async copyInviteLink() {
    const clipboardContent = await copyAndReadClipboard({
      page: this.page,
      copyAction: () =>
        this.page.getByTestId('poll-invite-copy-button').click(),
    })
    this.data.inviteLink = clipboardContent
    return clipboardContent
  }

  async expectCreationConfirmationEmail() {
    const confirmationEmail = await this.organisation.admin.mailbox.lookup(
      TemplateIds.fr.POLL_CREATED
    )
    expect(confirmationEmail).toBeDefined()
  }
}
