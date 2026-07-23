import { faker } from '@faker-js/faker'
import { Factory } from 'fishery'
import { prisma } from '../../../prisma/client.ts'
import type { ISOSupportedLanguage } from '../../geo/types/language.ts'
import { themes } from '../data/themes/index.ts'
import { mapActionTranslationsToPrismaCreate } from '../repositories/action-translation.mapper.ts'
import type { ActionMedia } from '../types/action-media.ts'
import type {
  Action,
  ActionTranslationInput,
  NewAction,
} from '../types/action.ts'
import { seoMetadataFactory } from './seo-metadata.factory.ts'

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

interface ActionFactoryTransientParams {
  /** Extra locale translations to create alongside the primary `fr` one. */
  translations: Partial<
    Record<Exclude<ISOSupportedLanguage, 'fr'>, ActionTranslationInput>
  >
}

class ActionFactory extends Factory<Action, ActionFactoryTransientParams> {
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

  /** Persist additional locale translations beyond the built `fr` one. */
  withTranslations(translations: ActionFactoryTransientParams['translations']) {
    return this.transient({ translations })
  }
}

export const actionFactory = ActionFactory.define(
  ({ onCreate, transientParams }) => {
    onCreate(async (data) => {
      const translations: NewAction['translations'] = {
        fr: {
          title: data.title,
          slug: data.slug,
          longDescription: data.longDescription,
          media: data.media,
          tips: data.tips ?? null,
          financialIncentives: data.financialIncentives ?? null,
          furtherExplore: data.furtherExplore ?? null,
          metadata: data.metadata,
        },
        ...transientParams.translations,
      }

      await prisma.action.create({
        data: {
          id: data.id,
          trackingId: data.trackingId,
          themeId: data.theme.id,
          ruleId: data.ruleId,
          publishedAt: data.publishedAt,
          deletedAt: data.deletedAt,
          translations: mapActionTranslationsToPrismaCreate(translations),
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
        slug: theme.slug,
        trackingId: theme.trackingId,
        title: theme.title,
        emoji: theme.emoji,
      },
      ruleId: faker.string.uuid(),
      media: faker.helpers.maybe(randomMedia),
      tips: faker.helpers.maybe(() => md(faker.lorem.sentence())),
      financialIncentives: faker.helpers.maybe(() =>
        md(faker.lorem.sentence())
      ),
      furtherExplore: faker.helpers.maybe(() => md(faker.lorem.sentence())),
      metadata: seoMetadataFactory.build(),
      publishedAt: faker.helpers.maybe(faker.date.anytime) ?? null,
      deletedAt: null,
    }
  }
)
