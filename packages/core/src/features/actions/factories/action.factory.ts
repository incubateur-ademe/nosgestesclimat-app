import { faker } from '@faker-js/faker'
import { Factory } from 'fishery'
import { prisma } from '../../../prisma/client.ts'
import type { NullableJsonNullValueInput } from '../../../prisma/generated/internal/prismaNamespace.ts'
import { themes } from '../data/themes/index.ts'
import type { ActionMedia } from '../types/action-media.ts'
import type { Action } from '../types/action.ts'
import { seoMetadataFactory } from './seo-metadata.factory.ts'

type ActionData = Action & {
  themeId: string
  publishedAt: Date | null
  deletedAt: Date | null
}

const md = (title: string): string =>
  `### ${title}\n\n${faker.lorem.paragraph()}\n\n${faker.lorem.paragraph()}\n\n- ${faker.lorem.sentence()}\n- ${faker.lorem.sentence()}\n- ${faker.lorem.sentence()}`

const randomMedia = (): ActionMedia | undefined => {
  const pick = faker.number.int({ min: 0, max: 2 })
  if (pick === 1)
    return {
      type: 'impact_co2',
      title: faker.lorem.words(3),
      data: { type: '/livraison' },
    }
  if (pick === 2)
    return {
      type: 'image',
      title: faker.lorem.words(3),
      src: faker.image.url(),
      alt: faker.lorem.words(4),
    }
  return undefined
}

class ActionFactory extends Factory<ActionData> {
  published() {
    return this.params({
      publishedAt: faker.date.past(),
    })
  }

  draft() {
    return this.params({
      publishedAt: null,
    })
  }

  scheduled() {
    return this.params({
      publishedAt: faker.date.future(),
    })
  }

  deleted() {
    return this.params({
      deletedAt: faker.date.past(),
    })
  }

  pendingDeletion() {
    return this.params({
      deletedAt: faker.date.future(),
    })
  }
}

export const actionFactory = ActionFactory.define(({ onCreate }) => {
  onCreate(async (data) => {
    await prisma.action.create({
      data: {
        id: data.id,
        title: data.title,
        slug: data.slug,
        trackingId: data.trackingId,
        longDescription: data.longDescription,
        themeId: data.themeId,
        ruleId: data.ruleId,
        media: data.media as unknown as object,
        tips: data.tips ?? null,
        financialIncentives: data.financialIncentives ?? null,
        furtherExplore: data.furtherExplore ?? null,
        publishedAt: data.publishedAt,
        deletedAt: data.deletedAt,
        seoMetadata: {
          create: {
            title: data.metadata.title ?? null,
            description: data.metadata.description ?? null,
            jsonLd:
              (data.metadata.jsonLd as unknown as NullableJsonNullValueInput) ??
              null,
          },
        },
      },
    })
    return data
  })

  const theme = faker.helpers.arrayElement(themes)
  const title = faker.lorem.words(4)
  const slug = faker.helpers.slugify(title.toLowerCase())

  return {
    id: faker.string.uuid(),
    title,
    slug,
    trackingId: `action_${slug}`,
    language: 'fr' as const,
    longDescription: md(faker.lorem.sentence()),
    theme: {
      id: theme.id,
      key: theme.key,
      trackingId: theme.trackingId,
      title: theme.title,
      emoji: theme.emoji,
    },
    themeId: theme.id,
    ruleId: faker.string.uuid(),
    media: faker.helpers.maybe(randomMedia),
    tips: faker.helpers.maybe(() => md(faker.lorem.sentence())),
    financialIncentives: faker.helpers.maybe(() => md(faker.lorem.sentence())),
    furtherExplore: faker.helpers.maybe(() => md(faker.lorem.sentence())),
    metadata: seoMetadataFactory.build(),
    publishedAt: faker.date.past(),
    deletedAt: null,
  }
})
