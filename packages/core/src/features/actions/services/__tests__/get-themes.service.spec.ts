import { describe, expect, it } from 'vitest'
import { themes } from '../../data/themes/index.ts'
import { getThemes } from '../get-themes.service.ts'

describe('getThemes', () => {
  it('returns all themes', async () => {
    const result = await getThemes()
    expect(result).toEqual(themes)
  })
})
