import { faker } from '@faker-js/faker'
import { Factory } from 'fishery'
import { prisma } from '../../../prisma/client.ts'
import type { ISOSupportedLanguage } from '../../geo/types/language.ts'
import type { ActionTranslationInput } from '../types/action.ts'
import { seoMetadataFactory } from './seo-metadata.factory.ts'

const md = (title: string): string =>
  `### ${title}\n\n${faker.lorem.paragraph()}`

interface ActionTranslationFactoryParams extends ActionTranslationInput {
  actionId: string
  locale: ISOSupportedLanguage
}

export const actionTranslationFactory =
  Factory.define<ActionTranslationFactoryParams>(({ onCreate }) => {
    onCreate(async (data) => {
      await prisma.actionTranslation.create({
        data: {
          actionId: data.actionId,
          locale: data.locale,
          title: data.title,
          slug: data.slug,
          longDescription: data.longDescription,
          media: data.media as unknown as object,
          tips: data.tips ?? null,
          financialIncentives: data.financialIncentives ?? null,
          furtherExplore: data.furtherExplore ?? null,
          seoMetadata: data.metadata
            ? {
                create: {
                  title: data.metadata.title ?? null,
                  description: data.metadata.description ?? null,
                  jsonLd: (data.metadata.jsonLd as unknown as object) ?? null,
                },
              }
            : undefined,
        },
      })
      return data
    })

    return {
      actionId: faker.string.uuid(),
      locale: 'en',
      title: faker.lorem.words(4),
      slug: faker.helpers.slugify(faker.lorem.words(4).toLowerCase()),
      longDescription: md(faker.lorem.sentence()),
      media: undefined,
      tips: faker.helpers.maybe(() => md(faker.lorem.sentence())),
      financialIncentives: faker.helpers.maybe(() =>
        md(faker.lorem.sentence())
      ),
      furtherExplore: faker.helpers.maybe(() => md(faker.lorem.sentence())),
      metadata: faker.helpers.maybe(() => seoMetadataFactory.build()),
    }
  })
