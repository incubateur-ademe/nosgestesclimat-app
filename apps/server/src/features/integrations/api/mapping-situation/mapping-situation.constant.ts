import { camelCase, kebabCase, pascalCase, snakeCase } from 'change-case'

export const MAPPING_CASES = {
  camelCase: 'camelCase',
  pascalCase: 'PascalCase',
  snakeCase: 'snake_case',
  kebabCase: 'kebab-case',
} as const

const changeCaseBuilder =
  (changer: (key: string) => string) => (object: unknown) => {
    if (!object || typeof object !== 'object') {
      return object
    }

    return Object.fromEntries(
      Object.entries(object).map(([k, v]) => [changer(k), v])
    )
  }

export const MAPPING_CASES_FUNC = {
  [MAPPING_CASES.camelCase]: changeCaseBuilder(camelCase),
  [MAPPING_CASES.kebabCase]: changeCaseBuilder(kebabCase),
  [MAPPING_CASES.pascalCase]: changeCaseBuilder(pascalCase),
  [MAPPING_CASES.snakeCase]: changeCaseBuilder(snakeCase),
}
