import { expect, type Page } from '@playwright/test'

export class Organisation {
  static CONNEXION_URL = '/organisations/connexion'
  static CREATION_URL = '/organisations/creer'

  static url(slug: string) {
    return `/organisations/${slug}`
  }

  static parametersUrl(slug: string) {
    return `${Organisation.url(slug)}/parametres`
  }

  constructor(public readonly page: Page) {}

  /** Fills the creation form and returns the slug of the created organisation. */
  async create({
    name,
    administrator,
  }: {
    name: string
    administrator: { firstName: string; lastName: string }
  }) {
    await expect(this.page).toHaveURL(Organisation.CREATION_URL)

    await this.page.getByTestId('organisation-name-input').fill(name)
    await this.page
      .getByTestId('organisation-administrator-first-name-input')
      .fill(administrator.firstName)

    await this.page
      .getByTestId('organisation-administrator-last-name-input')
      .fill(administrator.lastName)

    await this.page.getByTestId('create-organisation-button').click()

    const orgaUrl = /\/organisations\/([a-z0-9-]*)\/.*/
    await expect(this.page).toHaveURL(orgaUrl)
    return orgaUrl.exec(this.page.url())![1]
  }

  async goFromLandingPage() {
    await this.page.goto('/')
    await this.page.getByTestId('organisations-link').click()
    await this.page.waitForURL(/organisations/)
    await this.page.getByTestId('start-link').click()
  }
}
