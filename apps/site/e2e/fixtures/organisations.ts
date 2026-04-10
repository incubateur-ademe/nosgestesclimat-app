import { faker } from '@faker-js/faker'
import type { Page } from '@playwright/test'
import {
  getPlaywrightState,
  savePlaywrightState,
} from '../helpers/save-context'
import { ORGANISATION_ADMIN_STATE } from '../state'
import { test as base, expect, User } from './user'

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
    private data: Data = {
      name: faker.company.name(),
    }
  ) {}

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
      `Votre organisation ${this.data.name} a bien été créée`
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
    const orgaUrl = /\/organisations\/([a-z0-9\-]*)\/.*/
    await expect(this.page).toHaveURL(orgaUrl)
    this.data.slug = orgaUrl.exec(this.page.url())![1]
  }

  async goFromLandingPage() {
    await this.page.goto('/')
    await this.page.getByTestId('organisations-link').click()
    await this.page.waitForURL(/organisations/)
    await this.page.getByTestId('start-link').click()
  }

  async saveInContext() {
    await this.admin.saveInContext()
    await savePlaywrightState(this.page, 'organisation', this.data)
  }

  static async fromContext(page: Page) {
    const data = await getPlaywrightState<Data>(page, 'organisation')
    const admin = await User.fromContext(page)
    return new Organisation(page, admin, data)
  }
}

interface OrganisationPageFixtures {
  organisation: Organisation
}

const test = base.extend<OrganisationPageFixtures>({
  organisation: async ({ browser, user, setup, page, storageState }, use) => {
    if (setup) {
      return use(new Organisation(page, user))
    }

    const useCurrentContext = storageState === ORGANISATION_ADMIN_STATE
    if (useCurrentContext) {
      return use(await Organisation.fromContext(page))
    }

    const context = await browser.newContext({
      storageState: ORGANISATION_ADMIN_STATE,
    })

    page = await context.newPage()
    await use(await Organisation.fromContext(page))
    await page.context().close()
  },
})

export { expect, test }
