import { faker } from '@faker-js/faker'
import { Factory } from 'fishery'
import type { SeoMetadata } from '../types/seo-metadata.ts'

export const seoMetadataFactory = Factory.define<SeoMetadata>(() => ({
  title: faker.datatype.boolean() ? faker.lorem.sentence() : undefined,
  description: faker.datatype.boolean() ? faker.lorem.sentences(2) : undefined,
  jsonLd: undefined,
}))
