import type { DottedName } from '@incubateur-ademe/nosgestesclimat'

export const RULES_TO_HIDE = new Set<DottedName>([
  'commun . mix électrique . empreinte eau',
  'transport . voiture . entretien',
  'transport . voiture . barème construction . barème thermique . empreinte par kg',
  'transport . voiture . barème construction . barème électrique . empreinte par kg',
  'transport . voiture . barème construction . barème hybride . moteur électrique . empreinte',
])

export const KEYS_TO_OMIT = [
  'titre',
  'couleur',
  'abréviation',
  'icônes',
  'description',
  'résumé',
  'exposé',
  'unité',
  'question',
  'note',
  'références',
  // specific to NGC actions
  'effort',
  'inactive',
  // specific to NGC form generation, could be cool to visualize, but in a <details> tag, since it's big
  'mosaique',
]
