import { COOKIE_CONSENT_STORAGE_KEY } from '../constants'

export { expect, test } from '../fixtures'
export type { Locator, Page } from '../fixtures'

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
