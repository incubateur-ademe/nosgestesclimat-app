export const SIMULATOR_PATH = '/simulateur/bilan'
export const TUTORIAL_PATH = '/simulateur/tutoriel'
export const SIMULATOR_INTERCALAIRE_PATH = '/simulateur/intercalaire'
export const START_SIMULATION_PATH = '/simulateur/commencer'

export const MON_ESPACE_PATH = '/mon-espace'

export const END_PAGE_PATH = '/fin'
export const END_PAGE_ACTIONS_PATH = '/fin/actions'
export const END_PAGE_GROUPS_PATH = '/fin/groupes'

export const EMAIL_PAGE_PATH = '/simulateur/email'
export const DOCUMENTATION_PATH = '/documentation'
export const CONNEXION_PATH = '/connexion'
export const INSCRIPTION_PATH = '/inscription'
export const MON_ESPACE_RESULTS_PATH = '/mon-espace'
export const MON_ESPACE_ACTIONS_PATH = '/mon-espace/actions'
export const MON_ESPACE_GROUPS_PATH = '/mon-espace/groupes'
export const MON_ESPACE_SETTINGS_PATH = '/mon-espace/parametres'
export const MON_ESPACE_RESULTS_DETAIL_PATH =
  '/mon-espace/resultats/:simulationId'

export const ORGANISATION_HOME_PAGE = '/organisations'
export const ORGANISATION_CREATE_PATH = '/organisations/creer'
export const ORGANISATION_SIGN_IN_PATH = '/organisations/connexion'
export const ORGANISATION_SIGN_UP_PATH = '/organisations/inscription'

export const COLLECTIVE_TEST_BASE_PATH = '/organisations/creer-campagne'
export const COLLECTIVE_TEST_INFORMATIONS_PATH =
  `${COLLECTIVE_TEST_BASE_PATH}/informations` as string
export const COLLECTIVE_TEST_MODE_PATH =
  `${COLLECTIVE_TEST_BASE_PATH}/mode` as string
export const COLLECTIVE_TEST_CONNEXION_PATH =
  `${COLLECTIVE_TEST_BASE_PATH}/connexion` as string
export const COLLECTIVE_TEST_ORGANISATION_PATH =
  `${COLLECTIVE_TEST_BASE_PATH}/organisation` as string
export const COLLECTIVE_TEST_FINALISER_PATH =
  `${COLLECTIVE_TEST_BASE_PATH}/finaliser` as string

export const ACTION_DETAIL_PATH = (themeSlug: string, actionSlug: string) =>
  `/actions/${themeSlug}/${actionSlug}`
