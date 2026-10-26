'use server'

import type { Locale } from '@/i18nConfig'
import { parseModel } from '../server/model/models'
import { getRules } from './getRules'

export async function getCachedRules({
  modelStr,
  locale,
  isOptim,
}: {
  modelStr?: string
  locale: Locale
  isOptim?: boolean
}) {
  'use cache'
  return await getRules({
    ...(modelStr ? parseModel(modelStr) : {}),
    locale,
    isOptim,
  })
}
