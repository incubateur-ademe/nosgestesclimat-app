import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import CarbonFootprintHeroSwitch from '../CarbonFootprintHeroSwitch'

const useFeatureFlagMock = vi.hoisted(() => vi.fn())

vi.mock('@/hooks/useFeatureFlag', () => ({
  useFeatureFlag: useFeatureFlagMock,
}))

function renderSwitch() {
  render(
    <CarbonFootprintHeroSwitch
      control={<p>current section</p>}
      test={<p>new section</p>}
    />
  )
}

describe('CarbonFootprintHeroSwitch', () => {
  beforeEach(() => {
    useFeatureFlagMock.mockReset()
  })

  it('reads the ab-test-global-footprint-display flag', () => {
    renderSwitch()

    expect(useFeatureFlagMock).toHaveBeenCalledWith(
      'ab-test-global-footprint-display'
    )
  })

  it('shows the new section for the test-new-footprint-display variant', () => {
    useFeatureFlagMock.mockReturnValue('test-new-footprint-display')

    renderSwitch()

    expect(screen.getByText('new section')).toBeInTheDocument()
    expect(screen.queryByText('current section')).not.toBeInTheDocument()
  })

  it.each([
    ['control', 'control'],
    ['not resolved yet', undefined],
    ['a boolean flag', true],
    ['an unknown variant', 'another-variant'],
  ])('keeps the current section when the flag is %s', (_, value) => {
    useFeatureFlagMock.mockReturnValue(value)

    renderSwitch()

    expect(screen.getByText('current section')).toBeInTheDocument()
    expect(screen.queryByText('new section')).not.toBeInTheDocument()
  })
})
