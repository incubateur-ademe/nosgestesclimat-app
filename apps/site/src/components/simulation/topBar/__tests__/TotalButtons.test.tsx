import TotalButtons from '@/components/simulation/topBar/TotalButtons'
import { renderWithWrapper } from '@/helpers/tests/wrapper'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'

// Mock hooks
const mockUseDebug = vi.fn()
vi.mock('@/hooks/useDebug', () => ({
  useDebug: () => mockUseDebug(),
}))

// Mock Icon components
vi.mock('@/components/icons/ListIcon', () => ({
  default: () => <svg data-testid="list-icon" />,
}))

describe('TotalButtons', () => {
  const toggleQuestionList = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Question list button', () => {
    it('should render the question list button if isDebug is true', () => {
      mockUseDebug.mockReturnValue(true)

      renderWithWrapper(
        <TotalButtons toggleQuestionList={toggleQuestionList} />
      )

      expect(screen.getByText('Liste des questions')).toBeInTheDocument()
      expect(screen.getByTestId('list-icon')).toBeInTheDocument()
    })

    it('should not render anything if isDebug is false', () => {
      mockUseDebug.mockReturnValue(false)

      const { container } = renderWithWrapper(
        <TotalButtons toggleQuestionList={toggleQuestionList} />
      )

      expect(container.firstChild).toBeNull()
    })

    it('should call toggleQuestionList when the button is clicked', async () => {
      mockUseDebug.mockReturnValue(true)

      renderWithWrapper(
        <TotalButtons toggleQuestionList={toggleQuestionList} />
      )

      const button = screen.getByText('Liste des questions')
      await userEvent.click(button)

      expect(toggleQuestionList).toHaveBeenCalledTimes(1)
    })
  })
})
