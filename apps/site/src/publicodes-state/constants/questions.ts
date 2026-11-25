import type { DottedName } from '@incubateur-ademe/nosgestesclimat'

export const MUST_NOT_ASK_QUESTIONS = new Set<DottedName>([
  // Mosaic "Textile" is hidden but can be answered is "choix précis" is set to "oui".
  'divers . textile . empreinte précise',
  'divers . textile . choix précis',
  'divers . ameublement . meubles',
  'divers . électroménager . appareils',
  'métrique',
  'logement . chauffage . électricité',
  'futureco-data . transport . ferry . distance aller . orthodromique',
  'futureco-data . transport . ferry . durée du voyage',
  'futureco-data . transport . ferry . vitesse en kmh',
  'futureco-data . transport . ferry . cabine',
  'futureco-data . transport . ferry . groupe',
  'futureco-data . transport . ferry . consommation de services',
  'futureco-data . transport . ferry . voiture',
])

/**
 * Major question roots. A question is major when its name is a root or one of
 * its descendants (`root . ...`). Descendants are kept so a root like
 * `logement . chauffage` covers the whole branch in a single entry.
 *
 * We use the DottedName type from nosgestesclimat to make sure the build will
 * break when using rules that are not in the model.
 */
export const MAJOR_QUESTIONS: readonly DottedName[] = [
  'logement . type',
  'logement . surface',
  'logement . habitants',
  'logement . âge',
  'logement . chauffage',
  'logement . électricité',
  'logement . climatisation',
  'logement . lieu de vie',
  'alimentation . plats',
  'alimentation . petit déjeuner',
  'transport . voiture',
  'transport . avion',
  'transport . deux roues',
  'divers . numérique . appareils',
  'divers . ameublement . préservation',
  'divers . textile . volume',
  'divers . textile . qualité',
  'profil . âge',
]

export const isMajorQuestion = (dottedName: DottedName): boolean =>
  MAJOR_QUESTIONS.some(
    (root) => dottedName === root || dottedName.startsWith(`${root} . `)
  )

/**
 * The two questions that must always be asked last, in this order.
 */
export const LAST_QUESTIONS: readonly DottedName[] = [
  'logement . lieu de vie',
  'profil . âge',
]

// We use the DottedName type from nosgestesclimat to make sure the build will break when using rules that are not in the model.
export const PRIORITY_QUESTIONS = new Set<DottedName>([
  'alimentation . plats',
  'logement . type',
  'logement . lieu de vie',
  'logement . chauffage . bois . système',
  'transport . voiture . km',
  'transport . voiture . voyageurs',
])

export const NON_PRIORITY_QUESTIONS = new Set<DottedName>([
  'transport . voiture . thermique . consommation aux 100',
  'logement . chauffage . précision consommation . ressenti',
])

// This constant allow to display questions even if it's not missing variable. We keep the logic for now even if it's empty.
export const MUST_ASK_QUESTIONS = new Set<DottedName>([
  'logement . lieu de vie',
  'profil . âge',
])

export const MUST_SHOW_DESCRIPTION = new Set<DottedName>([
  'transport . voiture . utilisateur',
  'logement . âge',
  'logement . surface',
  'logement . chauffage . collectif',
  'divers . animaux domestiques . empreinte',
  'alimentation . plats',
  'alimentation . local . consommation',
  'transport . avion . vols annuels',
  'transport . avion . vols amortis',
  'profil . âge',
])

export const NUMBER_MOSAIC_WITHOUT_BUTTONS = new Set<DottedName>([
  'transport . avion . vols annuels',
  'transport . avion . vols amortis',
])
