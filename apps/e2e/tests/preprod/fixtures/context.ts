import type { Page } from '@playwright/test'
import path from 'path'

import { Group } from '../../pages/group'
import { Organisation } from '../../pages/organisation'
import { Poll } from '../../pages/poll'
import { User } from '../../pages/user'

const E2E_TEST_DATA_KEY = 'e2e-test-data'

export async function getPlaywrightState<T = unknown>(
  page: Page,
  key: string
): Promise<T | undefined> {
  const localStorage =
    (await page.context().storageState()).origins[0]?.localStorage ?? []
  const item = localStorage.find(
    (item) => item.name === `${E2E_TEST_DATA_KEY}::${key}`
  )?.value
  return item ? JSON.parse(item) : undefined
}

export async function savePlaywrightState(
  page: Page,
  key: string,
  value: unknown
): Promise<void> {
  return await page.evaluate(
    ([key, value]) => {
      localStorage.setItem(key as string, JSON.stringify(value))
    },
    [`${E2E_TEST_DATA_KEY}::${key}`, value]
  )
}

export function saveContext(page: Page, statePath: string) {
  return page.context().storageState({
    path: path.join(import.meta.dirname, '../../..', statePath),
  })
}

interface UserData {
  firstName: string
  lastName: string
  email: string
}

interface GroupData {
  name: string
  inviteLink?: string
  url?: string
}

interface OrganisationData {
  name: string
  slug?: string
}

interface PollData {
  name: string
  slug?: string
  inviteLink?: string
}

export async function saveUser(page: Page, user: User): Promise<void> {
  await savePlaywrightState(page, 'user', user.data)
}

export async function saveGroup(page: Page, group: Group): Promise<void> {
  await saveUser(page, group.admin)
  await savePlaywrightState(page, 'group', group.data)
}

export async function saveOrganisation(
  page: Page,
  organisation: Organisation
): Promise<void> {
  await saveUser(page, organisation.admin)
  await savePlaywrightState(page, 'organisation', organisation.data)
}

export async function savePoll(
  page: Page,
  poll: Poll,
  key = 'poll'
): Promise<void> {
  await savePlaywrightState(page, key, poll.data)
}

export async function restoreUser(page: Page): Promise<User> {
  const data = await getPlaywrightState<UserData>(page, 'user')
  return new User(page, data)
}

export async function restoreGroup(page: Page): Promise<Group> {
  const admin = await restoreUser(page)
  const data = await getPlaywrightState<GroupData>(page, 'group')
  return new Group(page, admin, data)
}

export async function restoreOrganisation(page: Page): Promise<Organisation> {
  const admin = await restoreUser(page)
  const data = await getPlaywrightState<OrganisationData>(page, 'organisation')
  return new Organisation(page, admin, data)
}

export async function restorePoll(
  page: Page,
  organisation: Organisation,
  key = 'poll'
): Promise<Poll> {
  const data = await getPlaywrightState<PollData>(page, key)
  return new Poll(page, organisation, data)
}
