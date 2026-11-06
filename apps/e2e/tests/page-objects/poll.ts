import { expect, type Page } from '@playwright/test'

import { copyAndReadClipboard } from '../helpers/clipboard'
import { Organisation } from './organisation'

export class Poll {
  static url(organisationSlug: string, slug: string) {
    return `${Organisation.url(organisationSlug)}/campagnes/${slug}`
  }

  static parametersUrl(organisationSlug: string, slug: string) {
    return `${Poll.url(organisationSlug, slug)}/parametres`
  }

  static createUrl(organisationSlug: string) {
    return `${Organisation.url(organisationSlug)}/creer-campagne`
  }

  /**
   * The invite link: the site's campagne route, which resolves a poll by id
   * or slug.
   */
  static inviteLink(pollIdOrSlug: string) {
    return `/simulateur/campagne/${pollIdOrSlug}`
  }

  constructor(public readonly page: Page) {}

  /** Fills the creation form and returns the slug of the created poll. */
  async create(name: string) {
    await expect(this.page).toHaveURL(/\/creer-campagne$/)
    // Clear first to avoid any default value from a previous poll's draft
    // (the input is pre-filled from a previous draft via react-hook-form)
    await this.page.getByTestId('poll-input').clear()
    await this.page.getByTestId('poll-input').fill(name)
    await this.page.getByTestId('poll-form-button').click()

    // Retrieve the poll slug (allow more time for the API call)
    const pollUrl = /\/campagnes\/([a-z0-9-]+)/
    await expect(this.page).toHaveURL(pollUrl)
    return pollUrl.exec(this.page.url())![1]
  }

  async copyInviteLink() {
    return await copyAndReadClipboard({
      page: this.page,
      copyAction: () =>
        this.page.getByTestId('poll-invite-copy-button').click(),
    })
  }
}
