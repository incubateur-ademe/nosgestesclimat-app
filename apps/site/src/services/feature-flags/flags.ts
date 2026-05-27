type FlagDefinition =
  | { kind: 'boolean' }
  | { kind: 'variant'; variants: readonly string[] }

export const FLAGS = {
  'actions-v2': { kind: 'boolean' },
  'mode-scolaire': { kind: 'boolean' },
  'ab-test-tranche': { kind: 'variant', variants: ['control', 'test'] },
} as const satisfies Record<string, FlagDefinition>

export type FeatureFlagName = keyof typeof FLAGS

export type FeatureFlagValue<K extends FeatureFlagName> = {
  'actions-v2': boolean
  'mode-scolaire': boolean
  'ab-test-tranche': 'control' | 'test'
}[K]
