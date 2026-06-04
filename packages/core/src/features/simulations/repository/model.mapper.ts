import type { Model, ModelLocale, ModelRegion } from '../types/model.ts'

const MODEL_STRING_RE = /^([A-Z]+)-(fr|en)-(.+)$/
const PUBLISHED_TAG_RE = /^\d+\.\d+\.\d+(-[\w.]+)?$/
const PR_VERSION_RE = /^pr-(.+)$/

export const parseModelString = (modelString: string): Model | null => {
  const match = modelString.match(MODEL_STRING_RE)
  if (!match) return null

  const [, region, locale, versionStr] = match

  let version: Model['version']
  if (PUBLISHED_TAG_RE.test(versionStr)) {
    version = { publishedTag: versionStr }
  } else if (PR_VERSION_RE.test(versionStr)) {
    version = { PRNumber: versionStr.replace(/^pr-/, '') }
  } else {
    return null
  }

  return {
    region: region as ModelRegion,
    locale: locale as ModelLocale,
    version,
  }
}

export const serializeModel = (model: Model): string => {
  const versionStr =
    'publishedTag' in model.version
      ? model.version.publishedTag
      : `pr-${model.version.PRNumber}`
  return `${model.region}-${model.locale}-${versionStr}`
}
