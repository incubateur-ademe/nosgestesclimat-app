import type { GroupDisplayInfo } from '@/helpers/server/model/utils/getGroupDisplayInfo'
import type { ComputedResults } from '@/publicodes-state/types'
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import CarbonFootprintResults from '../CarbonFootprintResults'

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
  it('shows the new footprint section', () => {
    render(
      <CarbonFootprintResults computedResults={computedResults} locale="fr" />
    )

    expect(screen.getByText('new section')).toBeInTheDocument()
  })

  it.each([
    ['a friends group', friendsGroup],
    ['an organisation campaign', organisationCampaign],
  ])('shows the new footprint section to participants of %s', (_, group) => {
    render(
      <CarbonFootprintResults
        computedResults={computedResults}
        locale="fr"
        group={group}
      />
    )

    expect(screen.getByText('new section')).toBeInTheDocument()
  })
})
