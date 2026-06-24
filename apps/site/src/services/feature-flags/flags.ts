export type FlagDefinition =
  | { kind: 'boolean' }
  | { kind: 'variant'; variants: readonly string[] }

export const FLAGS = {
  'actions-v2': { kind: 'boolean' },
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
