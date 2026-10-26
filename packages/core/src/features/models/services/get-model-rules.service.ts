import type { NGCRules } from '@incubateur-ademe/nosgestesclimat'
import { success, type Result } from '../../../lib/result.ts'
import type { Logger } from '../../logger/index.ts'
import type { ModelFileFetchFailedError } from '../errors.ts'
import { OutdatedModelVersionError } from '../errors.ts'
import { fetchModelFile } from '../helpers/fetch-model-file.ts'
import { getModelFileName } from '../helpers/get-model-file-name.ts'
import { importCurrentModel as defaultFindCurrentModel } from '../helpers/import-current-model.ts'
import {
  getPreviewModelUrl,
  getPublishedModelUrl,
} from '../helpers/model-rules-urls.ts'
import { CURRENT_MODEL_VERSION } from '../helpers/model-versions.ts'
import type { Model } from '../types/model.ts'

interface GetModelRulesDeps {
  /**
   * Loads the rules for the currently installed model. Defaults to a dynamic
   * import from the `@incubateur-ademe/nosgestesclimat` package, with the
   * optimized FR rule set statically imported so it ships in the bundle.
   */
  findCurrentModel?: (fileName: string) => Promise<NGCRules>
  /**
   * Loads an older published version from the registry CDN. Defaults to the
   * real implementation; tests override it to avoid hitting the network.
   */
  findPublishedModel?: (
    publishedTag: string,
    fileName: string
  ) => Promise<Result<NGCRules, ModelFileFetchFailedError>>
  /**
   * Loads a PR preview build from the preview bucket. Defaults to the real
   * implementation; tests override it to avoid hitting the network.
   */
  findPreviewModel?: (
    PRNumber: string | number,
    fileName: string
  ) => Promise<Result<NGCRules, ModelFileFetchFailedError>>
  logger: Logger
}

interface GetModelRulesOptions {
  isOptim?: boolean
  /**
   * What to do with a published tag other than the installed one.
   * `fetch` (worker) computes against the version the simulation was made
   * with; `fallback_to_current` (site) reports the mismatch and serves the
   * installed rules, because the site migrates situations forward anyway.
   */
  outdatedPublishedTagStrategy?: 'fetch' | 'fallback_to_current'
}

/**
 * Single entry point for retrieving a model's rules, whatever version it
 * points at: the installed package, a published tag on the npm CDN, or a PR
 * preview build.
 */
export function createGetModelRules(deps: GetModelRulesDeps) {
  const {
    findCurrentModel = defaultFindCurrentModel,
    findPublishedModel = defaultFindPublishedModel,
    findPreviewModel = defaultFindPreviewModel,
  } = deps
  const logger = deps.logger.child({ scope: 'core.service.getModelRules' })

  return async function getModelRules(
    model: Partial<Model> = {},
    {
      isOptim = false,
      outdatedPublishedTagStrategy = 'fetch',
    }: GetModelRulesOptions = {}
  ): Promise<Result<NGCRules, ModelFileFetchFailedError>> {
    const {
      region = 'FR',
      locale = 'fr',
      version = { publishedTag: CURRENT_MODEL_VERSION },
    } = model

    const fileName = getModelFileName({ region, locale, isOptim })

    if ('PRNumber' in version) {
      return await findPreviewModel(version.PRNumber, fileName)
    }

    if (version.publishedTag === CURRENT_MODEL_VERSION) {
      return success(await findCurrentModel(fileName))
    }

    if (outdatedPublishedTagStrategy === 'fallback_to_current') {
      logger.error(
        new OutdatedModelVersionError({
          message: `Model version mismatch: ${version.publishedTag} !== ${CURRENT_MODEL_VERSION}`,
          publishedTag: version.publishedTag,
          currentModelVersion: CURRENT_MODEL_VERSION,
        })
      )
      return success(await findCurrentModel(fileName))
    }

    return await findPublishedModel(version.publishedTag, fileName)
  }
}

const defaultFindPublishedModel = (
  publishedTag: string,
  fileName: string
): Promise<Result<NGCRules, ModelFileFetchFailedError>> =>
  fetchModelFile<NGCRules>(getPublishedModelUrl(publishedTag, fileName))

const defaultFindPreviewModel = (
  PRNumber: string | number,
  fileName: string
): Promise<Result<NGCRules, ModelFileFetchFailedError>> =>
  fetchModelFile<NGCRules>(getPreviewModelUrl(PRNumber, fileName))
