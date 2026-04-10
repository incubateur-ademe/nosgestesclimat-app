import { faker } from '@faker-js/faker'
import type { Page } from '@playwright/test'
import { copyAndReadClipboard } from '../helpers/clipboard'
import {
  getPlaywrightState,
  savePlaywrightState,
} from '../helpers/save-context'
import type { Organisation } from './organisations'

import { ORGANISATION_ADMIN_STATE } from '../state'
import { test as base, expect } from './organisations'

interface Data {
  name: string
  slug?: string
  inviteLink?: string
}

export class Poll {
  constructor(
    public readonly page: Page,
    private organisation: Organisation,
    private data: Data = {
      name: `${faker.company.buzzAdjective()} ${faker.company.buzzNoun()}`,
    }
  ) {}

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
    await expect(this.page).toHaveURL(this.createUrl)
    await this.page.getByTestId('poll-name-input').fill(this.name)
    await this.page.getByTestId('poll-create-button').click()

    // Retrieve the poll slug
    const pollUrl = /\/campagnes\/([a-z0-9\-]*)/
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
      `Votre campagne « ${this.name} » a bien été créée`
    )
    expect(confirmationEmail).toBeDefined()
  }

  async saveInContext() {
    await savePlaywrightState(this.page, 'poll', this.data)
  }

  static async fromContext(page: Page, organisation: Organisation) {
    const data = await getPlaywrightState<Data>(page, 'poll')
    return new Poll(page, organisation, data)
  }
}

interface PollPageFixtures {
  poll: Poll
}

const test = base.extend<PollPageFixtures>({
  poll: async ({ browser, organisation, setup, page, storageState }, use) => {
    if (setup) {
      return use(new Poll(page, organisation))
    }

    const useCurrentContext = storageState === ORGANISATION_ADMIN_STATE
    if (useCurrentContext) {
      return use(await Poll.fromContext(page, organisation))
    }

    const context = await browser.newContext({
      storageState: ORGANISATION_ADMIN_STATE,
    })

    page = await context.newPage()
    await use(await Poll.fromContext(page, organisation))
    await page.context().close()
  },
})

export { test }
