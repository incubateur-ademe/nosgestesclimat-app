import { faker } from '@faker-js/faker'
import { TemplateIds } from '@nosgestesclimat/core/features/emails/email.constant'
import { expect, type Page } from '@playwright/test'

import type { User } from './user'

interface Data {
  name: string
  slug?: string
}

export class Organisation {
  static CONNEXION_URL = '/organisations/connexion'
  static CREATION_URL = '/organisations/creer'
  constructor(
    public readonly page: Page,
    public admin: User,
    private _data: Data = {
      name: faker.company.name(),
    }
  ) {}

  get data(): Data {
    return this._data
  }

  get name() {
    return this.data.name
  }

  get url() {
    return `/organisations/${this.data.slug}`
  }

  get parametersUrl() {
    return `/organisations/${this.data.slug}/parametres`
  }

  async expectCreationConfirmationEmail() {
    const confirmationEmail = await this.admin.mailbox.lookup(
      TemplateIds.fr.ORGANISATION_CREATED
    )
    expect(confirmationEmail).toBeDefined()
  }

  async create() {
    await expect(this.page).toHaveURL(Organisation.CREATION_URL)

    await this.page.getByTestId('organisation-name-input').fill(this.data.name)
    await this.page
      .getByTestId('organisation-administrator-first-name-input')
      .fill(this.admin.firstName)

    await this.page
      .getByTestId('organisation-administrator-last-name-input')
      .fill(this.admin.lastName)

    await this.page.getByTestId('create-organisation-button').click()

    // Retrieve the organization slug
    const orgaUrl = /\/organisations\/([a-z0-9-]*)\/.*/
    await expect(this.page).toHaveURL(orgaUrl)
    this.data.slug = orgaUrl.exec(this.page.url())![1]
  }

  async goFromLandingPage() {
    await this.page.goto('/')
    await this.page.getByTestId('organisations-link').click()
    await this.page.waitForURL(/organisations/)
    await this.page.getByTestId('start-link').click()
  }
}
