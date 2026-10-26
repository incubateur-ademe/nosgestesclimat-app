import type { ModelLocale, ModelRegion } from '../types/model.ts'

/**
 * Optimized rule sets - where some rules are voluntarily removed to lighten
 * the payload - are only published for FR, so every other region gets its full
 * file whatever `isOptim` asks for.
 */
export function getModelFileName({
  region,
  locale,
  isOptim,
}: {
  region: ModelRegion
  locale: ModelLocale
  isOptim: boolean
}): string {
  if (region === 'FR' && isOptim) {
    return `co2-model.FR-lang.${locale}-opti.json`
  }
  return `co2-model.${region}-lang.${locale}.json`
}
