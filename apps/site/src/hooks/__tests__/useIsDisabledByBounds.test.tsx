import type { DottedName } from '@incubateur-ademe/nosgestesclimat'
import { renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useIsDisabledByBounds } from '../useIsDisabledByBounds'

// Mock the publicodes-state hooks
const mockUseRule = vi.fn()
const mockUseEngine = vi.fn()

vi.mock('@/publicodes-state', () => ({
  useRule: () => mockUseRule(),
  useEngine: () => mockUseEngine(),
}))

// Mock useMosaicState, which the hook uses to read each mosaic child value
const mockUseMosaicState = vi.fn()
vi.mock('@/components/form/question/mosaic/useMosaicState', () => ({
  useMosaicState: () => mockUseMosaicState(),
}))

describe('useIsDisabledByBounds', () => {
  const QUESTION = 'logement . surface' as DottedName
  const MOSAIC_CHILD = 'logement . chauffage . bois . bûches' as DottedName
  const MOSAIC_CHILD_2 = 'logement . chauffage . bois . granulés' as DottedName

  const mockSafeGetRule = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()

    // Default mock implementations
    mockUseRule.mockReturnValue({
      situationValue: undefined,
      plancher: 0,
      plafond: 1000000,
      questionsOfMosaicFromParent: [],
    })

    mockUseEngine.mockReturnValue({
      safeGetRule: mockSafeGetRule,
    })

    mockUseMosaicState.mockReturnValue({
      values: {},
    })
  })

  it('should return isNextDisabled=false when there is no numeric value', () => {
    const { result } = renderHook(() => useIsDisabledByBounds(QUESTION))

    expect(result.current.isNextDisabled).toBe(false)
    expect(result.current.overLimitQuestions).toEqual([])
  })

  it('should return isNextDisabled=true when the value is below the floor', () => {
    mockUseRule.mockReturnValue({
      situationValue: -10,
      plancher: 0,
      plafond: 1000000,
      questionsOfMosaicFromParent: [],
    })

    const { result } = renderHook(() => useIsDisabledByBounds(QUESTION))

    expect(result.current.isNextDisabled).toBe(true)
    expect(result.current.overLimitQuestions).toEqual([QUESTION])
  })

  it('should return isNextDisabled=true when the value is over the ceiling', () => {
    mockUseRule.mockReturnValue({
      situationValue: 2000000,
      plancher: 0,
      plafond: 1000000,
      questionsOfMosaicFromParent: [],
    })

    const { result } = renderHook(() => useIsDisabledByBounds(QUESTION))

    expect(result.current.isNextDisabled).toBe(true)
    expect(result.current.overLimitQuestions).toEqual([QUESTION])
  })

  it('should return isNextDisabled=false when the value is within bounds', () => {
    mockUseRule.mockReturnValue({
      situationValue: 42,
      plancher: 0,
      plafond: 1000000,
      questionsOfMosaicFromParent: [],
    })

    const { result } = renderHook(() => useIsDisabledByBounds(QUESTION))

    expect(result.current.isNextDisabled).toBe(false)
    expect(result.current.overLimitQuestions).toEqual([])
  })

  describe('mosaic children', () => {
    beforeEach(() => {
      mockUseRule.mockReturnValue({
        situationValue: undefined,
        plancher: 0,
        plafond: 1000000,
        questionsOfMosaicFromParent: [MOSAIC_CHILD, MOSAIC_CHILD_2],
      })
    })

    it('should disable next when a mosaic child is below its own floor', () => {
      mockUseMosaicState.mockReturnValue({
        values: { [MOSAIC_CHILD]: 5, [MOSAIC_CHILD_2]: 100 },
      })
      mockSafeGetRule.mockImplementation((dottedName: DottedName) => {
        if (dottedName === MOSAIC_CHILD) {
          return { rawNode: { plancher: 10, plafond: 100 } }
        }
        return { rawNode: { plancher: 0, plafond: 200 } }
      })

      const { result } = renderHook(() => useIsDisabledByBounds(QUESTION))

      expect(result.current.isNextDisabled).toBe(true)
      expect(result.current.overLimitQuestions).toEqual([MOSAIC_CHILD])
    })

    it('should disable next when a mosaic child is over its own ceiling', () => {
      mockUseMosaicState.mockReturnValue({
        values: { [MOSAIC_CHILD]: 50, [MOSAIC_CHILD_2]: 300 },
      })
      mockSafeGetRule.mockImplementation((dottedName: DottedName) => {
        if (dottedName === MOSAIC_CHILD) {
          return { rawNode: { plancher: 0, plafond: 100 } }
        }
        return { rawNode: { plancher: 0, plafond: 200 } }
      })

      const { result } = renderHook(() => useIsDisabledByBounds(QUESTION))

      expect(result.current.isNextDisabled).toBe(true)
      expect(result.current.overLimitQuestions).toEqual([MOSAIC_CHILD_2])
    })

    it('should NOT disable next when mosaic children use their own (different) bounds', () => {
      mockUseMosaicState.mockReturnValue({
        values: { [MOSAIC_CHILD]: 150 },
      })
      mockSafeGetRule.mockImplementation((dottedName: DottedName) => {
        if (dottedName === MOSAIC_CHILD) {
          return { rawNode: { plancher: 0, plafond: 200 } }
        }
        return { rawNode: { plancher: 0, plafond: 300 } }
      })

      const { result } = renderHook(() => useIsDisabledByBounds(QUESTION))

      expect(result.current.isNextDisabled).toBe(false)
      expect(result.current.overLimitQuestions).toEqual([])
    })

    it('should use per-child bounds: a value valid for the parent but invalid for the child disables next', () => {
      mockUseMosaicState.mockReturnValue({
        values: { [MOSAIC_CHILD]: 500 },
      })
      mockSafeGetRule.mockImplementation((dottedName: DottedName) => {
        if (dottedName === MOSAIC_CHILD) {
          return { rawNode: { plancher: 0, plafond: 100 } }
        }
        return { rawNode: { plancher: 0, plafond: 300 } }
      })

      const { result } = renderHook(() => useIsDisabledByBounds(QUESTION))

      expect(result.current.isNextDisabled).toBe(true)
      expect(result.current.overLimitQuestions).toEqual([MOSAIC_CHILD])
    })

    it('should not consider non-numeric mosaic children values', () => {
      mockUseMosaicState.mockReturnValue({
        values: { [MOSAIC_CHILD]: 'oui', [MOSAIC_CHILD_2]: false },
      })
      mockSafeGetRule.mockImplementation(() => ({
        rawNode: { plancher: 0, plafond: 100 },
      }))

      const { result } = renderHook(() => useIsDisabledByBounds(QUESTION))

      expect(result.current.isNextDisabled).toBe(false)
      expect(result.current.overLimitQuestions).toEqual([])
    })

    it('should default plancher/plafond when the child rule has none', () => {
      mockUseMosaicState.mockReturnValue({
        values: { [MOSAIC_CHILD]: -5, [MOSAIC_CHILD_2]: 2000000 },
      })
      mockSafeGetRule.mockImplementation(() => ({ rawNode: {} }))

      const { result } = renderHook(() => useIsDisabledByBounds(QUESTION))

      // -5 is below default plancher (0) → disabled
      // 2000000 is over default plafond (1000000) → disabled
      expect(result.current.isNextDisabled).toBe(true)
      expect(result.current.overLimitQuestions).toEqual([
        MOSAIC_CHILD,
        MOSAIC_CHILD_2,
      ])
    })

    it('should list both the question and mosaic children when both are over limits', () => {
      mockUseRule.mockReturnValue({
        situationValue: -1,
        plancher: 0,
        plafond: 1000000,
        questionsOfMosaicFromParent: [MOSAIC_CHILD, MOSAIC_CHILD_2],
      })
      mockUseMosaicState.mockReturnValue({
        values: { [MOSAIC_CHILD]: 500 },
      })
      mockSafeGetRule.mockImplementation((dottedName: DottedName) => {
        if (dottedName === MOSAIC_CHILD) {
          return { rawNode: { plancher: 0, plafond: 100 } }
        }
        return { rawNode: { plancher: 0, plafond: 300 } }
      })

      const { result } = renderHook(() => useIsDisabledByBounds(QUESTION))

      expect(result.current.isNextDisabled).toBe(true)
      expect(result.current.overLimitQuestions).toEqual([
        QUESTION,
        MOSAIC_CHILD,
      ])
    })
  })
})
