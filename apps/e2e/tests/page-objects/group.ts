import { expect, type Page } from '@playwright/test'

import { copyAndReadClipboard } from '../helpers/clipboard'

export class Group {
  static CREATION_URL = '/amis/creer'

  /** The group's results page (its dashboard), by group id. */
  static url(groupId: string) {
    return `/amis/resultats?groupId=${groupId}`
  }

  /** The invitation page an invited member lands on, by group id. */
  static inviteLink(groupId: string) {
    return `/amis/invitation?groupId=${groupId}`
  }

  constructor(public readonly page: Page) {}

  /** Fills the creation form and returns the id of the created group. */
  async create({ name, ownerName }: { name: string; ownerName: string }) {
    await this.page.getByTestId('group-input-owner-name').fill(ownerName)
    await this.page.getByTestId('group-name').fill(name)
    await this.page.getByTestId(`group-select-emoji-🍒`).click()
    await this.page.getByTestId('button-validate-create-group').click()

    const groupUrl = /groupId=([a-z0-9-]+)/
    await expect(this.page).toHaveURL(groupUrl)
    return groupUrl.exec(this.page.url())![1]
  }

  async delete() {
    await this.page.getByTestId('button-delete-group').click()
    await this.page.getByTestId('button-confirm-delete-group').click()
  }

  async changeName(newName: string) {
    await this.page.getByTestId('group-name-edit-button').click()
    await this.page.getByTestId('group-edit-input-name').fill(newName)
    await this.page.getByTestId('button-inline-input').click()
    await expect(this.page.getByTestId('group-name')).toContainText(newName)
  }

  async joinWithInviteLink(inviteLink: string, memberName: string) {
    await this.page.goto(inviteLink)
    await this.page.getByTestId('member-name').fill(memberName)
    await this.page.getByTestId('button-join-group').click()
  }

  async leave() {
    await this.page.getByTestId('button-leave-group').click()
    await expect(
      this.page.getByTestId('button-confirm-leave-group')
    ).toBeVisible()
    await this.page.getByTestId('button-confirm-leave-group').click()
  }

  async copyInviteLink() {
    return await copyAndReadClipboard({
      page: this.page,
      copyAction: () => this.page.getByTestId('invite-button').click(),
    })
  }

  async goFromGroupTabs(name: string) {
    await this.page.getByTestId('my-groups-tab').click()
    await this.page.waitForTimeout(500)
    await this.page.getByText(name).filter({ visible: true }).click()
  }
}
