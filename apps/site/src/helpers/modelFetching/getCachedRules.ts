'use server'

import type { Locale } from '@/i18nConfig'
import { type ModelString, parseModelString } from '../server/model/models'
import { getRules } from './getRules'

export async function getCachedRules({
  modelStr,
  locale,
  isOptim,
}: {
  modelStr?: ModelString
  locale: Locale
  isOptim?: boolean
}) {
  'use cache'
  return getRules({
    ...(modelStr ? parseModelString(modelStr) : {}),
    locale,
    isOptim,
  })
}
