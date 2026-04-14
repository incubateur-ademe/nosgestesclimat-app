import type { DottedName } from '@incubateur-ademe/nosgestesclimat'

export function decodeRuleNameFromPath(path: string): DottedName {
  return decodeURI(path)
    ?.replaceAll('/', ' . ')
    .replaceAll('-', ' ')
    .replaceAll('\u2011', '-') as DottedName
}
