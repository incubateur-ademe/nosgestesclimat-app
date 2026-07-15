import type { LanguageSwitchParams } from './getShouldBeLocalised'

type RouteParamValue = string | string[] | undefined

function asString(value: RouteParamValue): string | undefined {
  return typeof value === 'string' ? value : undefined
}

export function pickLanguageSwitchParams(
  params: Record<string, RouteParamValue>
): LanguageSwitchParams {
  return {
    category: asString(params.category),
    article: asString(params.article),
    landingPageSlug: asString(params.landingPageSlug),
  }
}
