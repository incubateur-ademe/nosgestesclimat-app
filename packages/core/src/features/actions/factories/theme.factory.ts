import { faker } from '@faker-js/faker'
import { Factory } from 'fishery'
import { themes } from '../data/themes/index.ts'
import type { Theme } from '../types/theme.ts'

export const themeFactory = Factory.define<Theme>(() => {
  const theme = faker.helpers.arrayElement(themes)
  return {
    id: theme.id,
    key: theme.key,
    slug: theme.slug,
    trackingId: theme.trackingId,
    title: theme.title,
    language: theme.language,
    emoji: theme.emoji,
  }
})
