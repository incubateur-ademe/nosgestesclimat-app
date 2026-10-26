import type { NGCRules } from '@incubateur-ademe/nosgestesclimat'

import logger from '@/logger/logger.server'
import { createGetModelRules } from '@nosgestesclimat/core/features/models/services/get-model-rules.service'
import { CURRENT_MODEL_VERSION, type Model } from '../server/model/models'

const getModelRules = createGetModelRules({ logger })

interface Props extends Model {
  isOptim?: boolean
}

/*
 * This function is used to get the rules. It is used in the useRules hook and can also be called directly from a server component.
 */
export async function getRules({
  isOptim = true,
  region = 'FR',
  locale = 'fr',
  version = {
    publishedTag: CURRENT_MODEL_VERSION,
  },
}: Partial<Props> = {}): Promise<NGCRules> {
  // The site migrates outdated situations forward to the current model
  // (see migrateSimulationIfNeeded), so it keeps rendering the installed
  // rules and only reports the mismatch. The worker is the one fetching old
  // versions.
  const result = await getModelRules(
    { region, locale, version },
    { isOptim, outdatedPublishedTagStrategy: 'fallback_to_current' }
  )
  if (!result.success) {
    throw result.error
  }
  return result.data
}
