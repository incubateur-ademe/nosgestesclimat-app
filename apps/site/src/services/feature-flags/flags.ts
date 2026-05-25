export const FEATURE_FLAGS = ['actions-v2', 'mode-scolaire'] as const

export type FeatureFlagName = (typeof FEATURE_FLAGS)[number]
