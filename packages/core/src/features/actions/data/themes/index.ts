import type { Theme } from '../../types/theme.ts'

export const food: Theme = {
  id: 'a3782c21-2da3-4697-809a-22ecfb88de6e',
  key: 'food',
  trackingId: 'alimentation',
  language: 'fr',
  title: 'Alimentation',
  emoji: '🍽️',
}

export const transport: Theme = {
  id: '4ce3c30a-4312-4162-b990-31211cb83e75',
  key: 'transport',
  trackingId: 'transport',
  language: 'fr',
  title: 'Transport',
  emoji: '🚙',
}

export const societalServices: Theme = {
  id: 'c7a6e80b-7cdc-49f4-b748-f2c637e9360e',
  key: 'societal_services',
  trackingId: 'services-societaux',
  language: 'fr',
  title: 'Services sociétaux',
  emoji: '🏛️',
}

export const housing: Theme = {
  id: '3e288fd3-5d41-4eac-aac1-4a14c63dda28',
  key: 'housing',
  trackingId: 'logement',
  language: 'fr',
  title: 'Logement',
  emoji: '🏠',
}

export const misc: Theme = {
  id: '352a6d89-3232-4386-a731-eb747bd0d3ee',
  key: 'misc',
  trackingId: 'divers',
  language: 'fr',
  title: 'Divers',
  emoji: '🛒',
}

export const themes: Theme[] = [
  food,
  transport,
  societalServices,
  housing,
  misc,
]
