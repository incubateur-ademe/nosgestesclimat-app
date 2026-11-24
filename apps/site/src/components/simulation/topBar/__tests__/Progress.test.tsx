import Progress from '@/components/simulation/topBar/Progress'
import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockUseFormState = vi.fn<
  () => {
    testAdvancement: number
    currentCategory: string
    currentQuestion: string
  }
>()

vi.mock('@/publicodes-state', () => ({
  useFormState: () => mockUseFormState(),
}))

vi.mock('@/hooks/useIsClient', () => ({
  useIsClient: () => true,
}))

vi.mock('@/helpers/getCategoryColorClass', () => ({
  getBackgroundDarkColor: () => '',
  getBackgroundLightColor: () => '',
}))

const renderProgress = () => render(<Progress />)

describe('Progress', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the progress bar on a regular question', () => {
    mockUseFormState.mockReturnValue({
      testAdvancement: 0.5,
      currentCategory: 'logement',
      currentQuestion: 'logement . type',
    })

    renderProgress()

    expect(screen.getByRole('progressbar')).toBeInTheDocument()
  })

  it.each(['logement . lieu de vie', 'profil . âge'])(
    'hides the progress bar on %s',
    (currentQuestion) => {
      mockUseFormState.mockReturnValue({
        testAdvancement: 0.9,
        currentCategory: 'logement',
        currentQuestion,
      })

      renderProgress()

      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
    }
  )
})
