import type { GroupDisplayInfo } from '@/helpers/server/model/utils/getGroupDisplayInfo'
import type { ComputedResults } from '@/publicodes-state/types'
import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import CarbonFootprintResults from '../CarbonFootprintResults'

const useFeatureFlagMock = vi.hoisted(() => vi.fn())

vi.mock('@/hooks/useFeatureFlag', () => ({
  useFeatureFlag: useFeatureFlagMock,
}))

vi.mock('@/components/results/FootprintBlock', () => ({
  default: () => <p>current section</p>,
}))
vi.mock('@/components/results/carbonFootprint/CarbonFootprintHero', () => ({
  default: () => <p>new section</p>,
}))
vi.mock('@/components/results/FootprintDetail', () => ({ default: () => null }))
vi.mock('@/components/results/GroupThankYouBlock', () => ({
  default: () => null,
}))
vi.mock('@/components/results/SaveResultsBlock', () => ({
  default: () => null,
}))
vi.mock('@/components/results/ActionsBlock', () => ({ default: () => null }))
vi.mock('@/components/results/objective/Objective', () => ({
  default: () => null,
}))
vi.mock('@/components/layout/HideInIframe', () => ({ default: () => null }))

const computedResults = { carbone: { bilan: 7600 } } as ComputedResults

const organisationCampaign: GroupDisplayInfo = {
  name: 'Campagne',
  href: '/organisations/orga/campagnes/campagne',
}

const friendsGroup: GroupDisplayInfo = {
  name: 'Amis',
  href: '/amis/resultats?groupId=1',
}

describe('CarbonFootprintResults', () => {
  beforeEach(() => {
    useFeatureFlagMock.mockReset()
    useFeatureFlagMock.mockReturnValue('test-new-footprint-display')
  })

  it('takes part in the footprint display test by default', () => {
    render(
      <CarbonFootprintResults computedResults={computedResults} locale="fr" />
    )

    expect(screen.getByText('new section')).toBeInTheDocument()
    expect(useFeatureFlagMock).toHaveBeenCalled()
  })

  it.each([
    ['a friends group', friendsGroup],
    ['an organisation campaign', organisationCampaign],
  ])(
    'keeps the current section, without reading the flag, for participants of %s',
    (_, group) => {
      render(
        <CarbonFootprintResults
          computedResults={computedResults}
          locale="fr"
          group={group}
        />
      )

      expect(screen.getByText('current section')).toBeInTheDocument()
      expect(screen.queryByText('new section')).not.toBeInTheDocument()
      expect(useFeatureFlagMock).not.toHaveBeenCalled()
    }
  )

  it('keeps the current section, without reading the flag, when the test is disabled', () => {
    render(
      <CarbonFootprintResults
        computedResults={computedResults}
        locale="fr"
        disableHeroTest
      />
    )

    expect(screen.getByText('current section')).toBeInTheDocument()
    expect(useFeatureFlagMock).not.toHaveBeenCalled()
  })
})
