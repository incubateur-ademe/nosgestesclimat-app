import type { ThemeRow } from '../../types/theme.ts'

export const food: ThemeRow = {
  id: 'a3782c21-2da3-4697-809a-22ecfb88de6e',
  key: 'food',
  slug: 'alimentation',
  slugEn: 'food',
  trackingId: 'alimentation',
  title: 'Alimentation',
  titleEn: 'Food',
  emoji: '🍽️',
}

export const transport: ThemeRow = {
  id: '4ce3c30a-4312-4162-b990-31211cb83e75',
  key: 'transport',
  slug: 'transport',
  slugEn: 'transport',
  trackingId: 'transport',
  title: 'Transport',
  titleEn: 'Transport',
  emoji: '🚙',
}

export const societalServices: ThemeRow = {
  id: 'c7a6e80b-7cdc-49f4-b748-f2c637e9360e',
  key: 'societal_services',
  slug: 'services-societaux',
  slugEn: 'societal-services',
  trackingId: 'services-societaux',
  title: 'Services sociétaux',
  titleEn: 'Societal services',
  emoji: '🏛️',
}

export const housing: ThemeRow = {
  id: '3e288fd3-5d41-4eac-aac1-4a14c63dda28',
  key: 'housing',
  slug: 'logement',
  slugEn: 'housing',
  trackingId: 'logement',
  title: 'Logement',
  titleEn: 'Housing',
  emoji: '🏠',
}

export const misc: ThemeRow = {
  id: '352a6d89-3232-4386-a731-eb747bd0d3ee',
  key: 'misc',
  slug: 'consommation',
  slugEn: 'consumption',
  trackingId: 'consommation',
  title: 'Consommation',
  titleEn: 'Consumption',
  emoji: '🛒',
}

export const themes: ThemeRow[] = [
  housing,
  food,
  transport,
  misc,
  societalServices,
]

export const themesById = Object.fromEntries(
  themes.map((theme) => [theme.id, theme])
)
