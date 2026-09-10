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

// The language switch reads the browser URL and DOM hreflang tags, so we
// isolate it and only assert on what TotalButtons is responsible for.
vi.mock('@/components/translation/LanguageSwitchButton', () => ({
  default: () => <div data-testid="language-switch-button" />,
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

    it('should render the language switch but not the question list button if isDebug is false', () => {
      mockUseDebug.mockReturnValue(false)

      renderWithWrapper(
        <TotalButtons toggleQuestionList={toggleQuestionList} />
      )

      expect(screen.getByTestId('language-switch-button')).toBeInTheDocument()
      expect(screen.queryByText('Liste des questions')).not.toBeInTheDocument()
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
