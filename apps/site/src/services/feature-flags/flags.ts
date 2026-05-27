import { AGE_RANGE_KEY } from '@/constants/ab-test'

export const FEATURE_FLAGS = [
  'actions-v2',
  'mode-scolaire',
  AGE_RANGE_KEY,
] as const

export type FeatureFlagName = (typeof FEATURE_FLAGS)[number]
