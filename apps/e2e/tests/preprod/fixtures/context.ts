import type { Browser, Page } from '@playwright/test'
import path from 'path'

import type { UserData } from '../../helpers/test-data'
import { Organisation } from '../../page-objects/organisation'
import { Poll } from '../../page-objects/poll'

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

interface SavedGroup {
  name: string
  url: string
  inviteLink: string
}

interface SavedOrganisation {
  name: string
  slug: string
}

interface SavedPoll {
  name: string
  slug: string
  inviteLink: string
}

export interface RestoredGroup extends SavedGroup {
  admin: UserData
}

export interface RestoredOrganisation extends SavedOrganisation {
  admin: UserData
  url: string
  parametersUrl: string
}

export interface RestoredPoll extends SavedPoll {
  url: string
  createUrl: string
}

async function requirePlaywrightState<T>(page: Page, key: string): Promise<T> {
  const state = await getPlaywrightState<T>(page, key)
  if (!state) {
    throw new Error(
      `No "${key}" saved in this storage state: did the preprod setup project run?`
    )
  }
  return state
}

export async function saveUser(page: Page, user: UserData): Promise<void> {
  await savePlaywrightState(page, 'user', user)
}

export async function saveGroup(
  page: Page,
  group: SavedGroup,
  admin: UserData
): Promise<void> {
  await saveUser(page, admin)
  await savePlaywrightState(page, 'group', group)
}

export async function saveOrganisation(
  page: Page,
  organisation: SavedOrganisation,
  admin: UserData
): Promise<void> {
  await saveUser(page, admin)
  await savePlaywrightState(page, 'organisation', organisation)
}

export async function savePoll(
  page: Page,
  poll: SavedPoll,
  key = 'poll'
): Promise<void> {
  await savePlaywrightState(page, key, poll)
}

/** The user saved in the page's storage state: a new visitor has none. */
export async function restoreUser(page: Page): Promise<UserData | undefined> {
  return await getPlaywrightState<UserData>(page, 'user')
}

export async function restoreGroup(page: Page): Promise<RestoredGroup> {
  return {
    ...(await requirePlaywrightState<SavedGroup>(page, 'group')),
    admin: await requirePlaywrightState<UserData>(page, 'user'),
  }
}

export async function restoreOrganisation(
  page: Page
): Promise<RestoredOrganisation> {
  const organisation = await requirePlaywrightState<SavedOrganisation>(
    page,
    'organisation'
  )
  return {
    ...organisation,
    admin: await requirePlaywrightState<UserData>(page, 'user'),
    url: Organisation.url(organisation.slug),
    parametersUrl: Organisation.parametersUrl(organisation.slug),
  }
}

export async function restorePoll(
  page: Page,
  organisation: RestoredOrganisation,
  key = 'poll'
): Promise<RestoredPoll> {
  const poll = await requirePlaywrightState<SavedPoll>(page, key)
  return {
    ...poll,
    url: Poll.url(organisation.slug, poll.slug),
    createUrl: Poll.createUrl(organisation.slug),
  }
}

/** Reads data saved in another storage state than the one of the current test. */
export async function restoreFromState<T>(
  browser: Browser,
  statePath: string,
  restore: (page: Page) => Promise<T>
): Promise<T> {
  const context = await browser.newContext({ storageState: statePath })
  try {
    return await restore(await context.newPage())
  } finally {
    await context.close()
  }
}
