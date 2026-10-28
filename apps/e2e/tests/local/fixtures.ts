import { mergeTests } from '@playwright/test'
import { COOKIE_CONSENT_STORAGE_KEY } from '../constants'
import { test as sharedTest } from '../fixtures'
import { test as databaseTest } from './database'

/** Shared fixtures, plus the per-test reset of the worker's database. */
export const test = mergeTests(sharedTest, databaseTest)
export { expect } from '../fixtures'
export type { Locator, Page } from '../fixtures'
export { resetDatabase } from './database'

/**
 * Local suite: cookie banner dismissed, no session. Built in place rather than
 * recorded by a setup project, since each local test seeds its own data.
 */
export const localVisitorState = (origin: string) => ({
  cookies: [],
  origins: [
    {
      origin,
      localStorage: [
        {
          name: COOKIE_CONSENT_STORAGE_KEY,
          value: JSON.stringify({ posthog: 'refused', googleTag: 'refused' }),
        },
        { name: '__ph_opt_in_out_', value: '0' },
      ],
    },
  ],
})
