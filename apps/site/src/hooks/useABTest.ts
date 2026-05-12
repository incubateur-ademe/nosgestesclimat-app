import { DEFAULT_TEST_VARIANT_KEY } from '@/constants/ab-test'
import { useFeatureFlagVariantKey } from '@posthog/react'

// Pass key as a prop to make this hook durable
export function useABTest(testKey: string) {
  return useFeatureFlagVariantKey(testKey) == DEFAULT_TEST_VARIANT_KEY
}
