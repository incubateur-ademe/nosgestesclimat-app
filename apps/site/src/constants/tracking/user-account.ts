export const headerClickMonEspaceAuthenticatedServer = [
  'trackEvent',
  'Header',
  'Click Mon espace',
  'Authenticated',
]

export const headerClickAccessMySpaceAuthenticatedServer = [
  'trackEvent',
  'Header',
  'Click Accéder à mon espace',
  'Authenticated',
]

export const headerClickLogoutAuthenticatedServer = [
  'trackEvent',
  'Header',
  'Click Déconnexion',
  'Authenticated',
]

/** Server-side tracking */
export const headerClickMonEspaceUnauthenticatedServer =
  'Header|Click Mon espace|Unauthenticated'

/** Server-side tracking */

export const clickDashboardGroupPageNoGroupsCreate = [
  'trackEvent',
  'User Account Groups',
  'Click Create Group',
  'No Groups No Organisation',
]

export const clickDashboardGroupPageCreateOrganisation = [
  'trackEvent',
  'User Account Groups',
  'Click Create Organisation',
  'No Groups No Organisation',
]

export const clickLatestResultsViewDetail =
  'User Account Results|Click Latest Results View Detail'

export const clickResultsListResultViewDetail = [
  'trackEvent',
  'User Account Results',
  'Click Results List Result View Detail',
]

export const clickShareSimulationButton = [
  'trackEvent',
  'User Account Results',
  'Click Share Simulation Button',
]

export const clickCategorySelector = (category: string) => [
  'trackEvent',
  'User Account Results',
  'Click Category Selector',
  category,
]

export const clickCategorySelectorMobile = (category: string) => [
  'trackEvent',
  'User Account Results',
  'Click Category Selector Mobile',
  category,
]

export const clickUpdateUserEmail = [
  'trackEvent',
  'User Account Settings',
  'Click Update User Email',
]

export const clickUpdateUserNewsletters = [
  'trackEvent',
  'User Account Settings',
  'Click Update Newsletters',
]
