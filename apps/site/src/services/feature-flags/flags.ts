export type FlagDefinition =
  | { kind: 'boolean' }
  | { kind: 'variant'; variants: readonly string[] }

export const FLAGS = {
  'abc-test-layout-catalogue': {
    kind: 'variant',
    variants: ['control', 'test-fond-blanc', 'test-fond-bleu'],
  },
  'abc-test-action-card': {
    kind: 'variant',
    variants: ['control', 'cta', 'teaser-cta'],
  },
} as const satisfies Record<string, FlagDefinition>

export type FeatureFlagName = keyof typeof FLAGS

type FlagValueMap = {
  [K in FeatureFlagName]: (typeof FLAGS)[K] extends {
    kind: 'variant'
    variants: readonly (infer V)[]
  }
    ? V
    : boolean
}

export type FeatureFlagValue<K extends FeatureFlagName> = FlagValueMap[K]

export type DefaultFlagValues = FlagValueMap
