// Black-box contract with the app under test. Values mirror:
// - apps/site/src/constants/urls/paths.ts
// - apps/site/src/services/feature-flags/constants.ts
export const START_SIMULATION_PATH = '/simulateur/commencer'
export const EMAIL_PAGE_PATH = '/simulateur/email'
export const FF_COOKIE_NAME = 'ngc_ff_overrides'

// Mailisk delivers every address of the namespace to a single inbox, so the
// domain follows the namespace var; the local stub accepts the reserved TLD.
export const TEST_EMAIL_DOMAIN = process.env.E2E_MAILBOX_MAILISK_NAMESPACE
  ? `${process.env.E2E_MAILBOX_MAILISK_NAMESPACE}.mailisk.net`
  : 'e2e.test'
