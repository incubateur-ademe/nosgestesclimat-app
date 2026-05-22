import { actionFactory } from '@nosgestesclimat/core/features/actions/factories/action.factory'
import { describe, expect, it } from 'vitest'
import { toActionDto } from '../actions.dto'

describe('toActionDto', () => {
  it('should transform action entity to action DTO', () => {
    const action = actionFactory.build()
    const result = toActionDto(action)

    expect(result).toEqual({
      id: action.id,
      title: action.title,
      slug: action.slug,
      trackingId: action.trackingId,
      language: action.language,
      longDescription: action.longDescription,
      theme: action.theme,
      ruleId: action.ruleId,
      media: action.media,
      tips: action.tips,
      financialIncentives: action.financialIncentives,
      furtherExplore: action.furtherExplore,
      metadata: action.metadata,
      publishedAt: action.publishedAt,
    })
  })

  it('should handle action with optional fields', () => {
    const action = actionFactory.build({
      media: undefined,
      tips: undefined,
      financialIncentives: undefined,
      furtherExplore: undefined,
    })
    const result = toActionDto(action)

    expect(result.media).toBeUndefined()
    expect(result.tips).toBeUndefined()
    expect(result.financialIncentives).toBeUndefined()
    expect(result.furtherExplore).toBeUndefined()
  })

  it('should handle action with all fields defined', () => {
    const action = actionFactory.build({
      media: {
        type: 'image',
        title: 'Test image',
        src: 'https://example.com/image.jpg',
        alt: 'Test alt',
      },
      tips: 'Test tips',
      financialIncentives: 'Test incentives',
      furtherExplore: 'Test further explore',
    })
    const result = toActionDto(action)

    expect(result.media).toEqual(action.media)
    expect(result.tips).toEqual(action.tips)
    expect(result.financialIncentives).toEqual(action.financialIncentives)
    expect(result.furtherExplore).toEqual(action.furtherExplore)
  })
})
