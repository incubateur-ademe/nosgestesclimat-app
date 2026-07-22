import { describe, expect, it } from 'vitest'
import { themes } from '../../data/themes/index.ts'
import { getThemes } from '../get-themes.service.ts'

describe('getThemes', () => {
  it('returns all themes with french translation', async () => {
    const result = await getThemes('fr')
    expect(result).toEqual(
      themes.map(({ titleEn: _titleEn, slugEn: _slugEn, ...theme }) => ({
        ...theme,
        locale: 'fr',
      }))
    )
  })

  it('returns all themes with english translation', async () => {
    const result = await getThemes('en')
    expect(result).toEqual(
      themes.map(({ titleEn, slugEn, ...theme }) => ({
        ...theme,
        title: titleEn,
        slug: slugEn,
        locale: 'en',
      }))
    )
  })
})
