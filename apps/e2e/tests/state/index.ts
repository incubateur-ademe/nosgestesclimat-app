import { COOKIE_CONSENT_STORAGE_KEY } from '../constants'

/** Cookie banner dismissed, user_id created */
export const NEW_VISITOR_STATE = './tests/state/base.json'

/** User with a test completed */
export const COMPLETED_TEST_STATE = './tests/state/completed-test.json'

/** User with a test completed that saved its simulation at the end */
export const USER_ACCOUNT_STATE = './tests/state/user-account.json'

/** User with a test completed and a group created */
export const GROUP_ADMIN_STATE = './tests/state/created-group.json'

/** Organisation admin connected, with a poll created */
export const ORGANISATION_ADMIN_STATE = './tests/state/organisation.json'

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
