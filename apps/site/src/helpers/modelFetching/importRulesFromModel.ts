import logger from '@/logger/logger.server'
import { toError } from '@nosgestesclimat/core/lib/to-error'

export async function importRulesFromModel({
  fileName,
}: {
  fileName: string
}): Promise<unknown> {
  try {
    return await import(
      `@incubateur-ademe/nosgestesclimat/public/${fileName}`
    ).then((module) => module.default)
  } catch (error) {
    logger.error(toError(error), {
      scope: 'site.action.importRulesFromModel',
      fileName,
    })
    return {}
  }
}
