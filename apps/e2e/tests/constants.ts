// Black-box contract with the app under test. Values mirror:
// - apps/site/src/constants/urls/paths.ts
// - apps/site/src/services/feature-flags/constants.ts
export const START_SIMULATION_PATH = '/simulateur/commencer'
export const EMAIL_PAGE_PATH = '/simulateur/email'
export const FF_COOKIE_NAME = 'ngc_ff_overrides'

// Reserved TLD (RFC 6761), never deliverable. Also the domain the preprod
// read-only FGP access to the Brevo logs is scoped to.
export const TEST_EMAIL_DOMAIN = 'e2e.test'
