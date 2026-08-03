import { describe, expect, it } from 'vitest'
import type { Model } from '../../../simulations/types/model.ts'
import {
  CURRENT_MODEL_VERSION,
  PREVIOUS_MODEL_VERSION,
} from '../model-versions.ts'
import { resolveVersionKind } from '../resolve-version-kind.ts'

const baseModel: Model = {
  region: 'FR',
  locale: 'fr',
  version: { publishedTag: CURRENT_MODEL_VERSION },
}

describe('resolveVersionKind', () => {
  it('returns "current" for the current published tag', () => {
    expect(resolveVersionKind(baseModel)).toBe('current')
  })

  it('returns "previous" for the previous published tag', () => {
    expect(
      resolveVersionKind({
        ...baseModel,
        version: { publishedTag: PREVIOUS_MODEL_VERSION },
      })
    ).toBe('previous')
  })

  it('returns null for an arbitrary older tag', () => {
    expect(
      resolveVersionKind({ ...baseModel, version: { publishedTag: '0.0.1' } })
    ).toBeNull()
  })

  it('returns null for a PR preview version', () => {
    expect(
      resolveVersionKind({ ...baseModel, version: { PRNumber: '42' } })
    ).toBeNull()
  })
})
