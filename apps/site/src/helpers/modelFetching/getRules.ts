import type { NGCRules } from '@incubateur-ademe/nosgestesclimat'
import rulesOpti from '@incubateur-ademe/nosgestesclimat/public/co2-model.FR-lang.fr-opti.json'

import { captureException } from '@sentry/nextjs'
import { CURRENT_MODEL_VERSION, type Model } from '../server/model/models'
import { importPreviewFile } from './importPreviewFile'
import { importRulesFromModel } from './importRulesFromModel'

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
  // We provide the FR version of the model if the region is not supported
  let fileName = ''

  if ('PRNumber' in version) {
    if (region === 'FR') {
      fileName = `co2-model.FR-lang.${locale}${isOptim ? '-opti' : ''}.json`
    } else {
      fileName = `co2-model.${region}-lang.${locale}.json`
    }
    return importPreviewFile({
      fileName,
      PRNumber: version.PRNumber,
    }) as Promise<NGCRules>
  }

  if (version.publishedTag !== CURRENT_MODEL_VERSION) {
    captureException(
      new Error(
        `Model version mismatch: ${version.publishedTag} !== ${CURRENT_MODEL_VERSION}`
      )
    )
  }

  if (region === 'FR' && locale === 'fr' && isOptim === true) {
    // The rules are optimized so some rules are voluntarily removed. While we don't implement a specific type for this
    // subset, we accept to loose some of type soundness for increased code clarity.
    return rulesOpti as unknown as NGCRules
  }
  if (region === 'FR') {
    fileName = `co2-model.FR-lang.${locale}${isOptim ? '-opti' : ''}.json`
  } else {
    fileName = `co2-model.${region}-lang.${locale}.json`
  }
  return importRulesFromModel({
    fileName,
  }) as Promise<NGCRules>
}
