import type { DottedName } from '@incubateur-ademe/nosgestesclimat'

export const MUST_NOT_ASK_QUESTIONS = new Set<DottedName>([
  // Mosaic "Textile" is hidden but can be answered is "choix précis" is set to "oui".
  'divers . textile . empreinte précise',
  'divers . textile . choix précis',
  'divers . ameublement . meubles',
  'divers . électroménager . appareils',
  'divers . publicité',
  'services sociétaux . pression locale',
  'services sociétaux . voter',
  'divers . aider les autres',
  'divers . partage NGC',
  'métrique',
  'logement . électricité verte',
  'logement . chauffage . électricité',
  'futureco-data . transport . ferry . distance aller . orthodromique',
  'futureco-data . transport . ferry . durée du voyage',
  'futureco-data . transport . ferry . vitesse en kmh',
  'futureco-data . transport . ferry . cabine',
  'futureco-data . transport . ferry . groupe',
  'futureco-data . transport . ferry . consommation de services',
  'futureco-data . transport . ferry . voiture',
  'services sociétaux . devenir producteur photovoltaique',
  'services sociétaux . bien placer argent',
])

// We use the DottedName type from nosgestesclimat to make sure the build will break when using rules that are not in the model.
const PRIORITY_QUESTIONS_BASE_MODE = new Set<DottedName>([
  'alimentation . plats',
  'logement . type',
  'logement . propriétaire',
  'logement . chauffage . bois . système',
  'logement . électricité . réseau . consommation',
  'transport . voiture . km',
  'transport . voiture . voyageurs',
  'divers . numérique . internet . durée journalière',
])

const PRIORITY_QUESTIONS_ED_MODE = new Set<string>([
  'transport . voiture . km . hebdo . possibilités',
  'transport . voiture . km . annuel . possibilités',
])

export const PRIORITY_QUESTIONS = new Set([
  ...PRIORITY_QUESTIONS_BASE_MODE,
  ...PRIORITY_QUESTIONS_ED_MODE,
]) as Set<DottedName>

export const NON_PRIORITY_QUESTIONS = new Set<DottedName>([
  'logement . électricité . réseau . consommation',
  'transport . voiture . thermique . consommation aux 100',
  'logement . chauffage . saisie précision consommation',
  'logement . chauffage . précision consommation . ressenti',
  'logement . chauffage . précision consommation . DPE',
])

// This constant allow to display questions even if it's not missing variable. We keep the logic for now even if it's empty.
export const MUST_ASK_QUESTIONS = new Set<DottedName>([])

export const MUST_SHOW_DESCRIPTION = new Set<DottedName>([
  'transport . voiture . utilisateur',
  'logement . âge',
  'logement . surface',
  'logement . chauffage . collectif',
  'divers . animaux domestiques . empreinte',
  'alimentation . local . consommation',
  'transport . avion . vols annuels',
  'transport . avion . vols amortis',
])

export const NUMBER_MOSAIC_WITHOUT_BUTTONS = new Set<DottedName>([
  'transport . avion . vols annuels',
  'transport . avion . vols amortis',
])
