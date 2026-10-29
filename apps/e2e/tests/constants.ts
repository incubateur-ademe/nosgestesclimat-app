// Black-box contract with the app under test. Values mirror:
// - apps/site/src/constants/urls/paths.ts
// - apps/site/src/services/feature-flags/constants.ts
// - apps/site/src/helpers/server/cookie/auth.cookie.ts
// - apps/site/src/services/tracking/cookieStateStore.ts
// - apps/site/src/constants/organisations/administrator.ts
export const START_SIMULATION_PATH = '/simulateur/commencer'
export const EMAIL_PAGE_PATH = '/simulateur/email'
export const FF_COOKIE_NAME = 'ngc_ff_overrides'
export const SESSION_COOKIE_NAME = 'ngc_session'
export const REFRESH_COOKIE_NAME = 'ngc_refresh'
export const COOKIE_CONSENT_STORAGE_KEY = 'cookie-management-state'
export const ADMINISTRATOR_NAME_SEPARATOR = '\n_\n'

// Reserved TLD (RFC 6761), never deliverable. Also the domain the preprod
// read-only FGP access to the Brevo logs is scoped to.
export const TEST_EMAIL_DOMAIN = 'e2e.test'
