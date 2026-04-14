import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import CopyInput from '../CopyInput'

// Mock the translation hook
const mockT = vi.fn((key: string, defaultValue: string) => defaultValue)
vi.mock('@/hooks/useClientTranslation', () => ({
  useClientTranslation: () => ({
    t: mockT,
  }),
}))

describe('CopyInput', () => {
  const defaultProps = {
    textToCopy: 'https://example.com/test-link',
    textToDisplay: 'https://example.com/test-link',
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render with default props', () => {
      render(<CopyInput {...defaultProps} />)

      expect(screen.getByRole('textbox')).toBeInTheDocument()
      expect(screen.getByRole('button')).toBeInTheDocument()
      expect(screen.getByRole('button')).toHaveTextContent('Copier le lien')
    })

    it('should render with custom text to display', () => {
      render(
        <CopyInput
          textToCopy="https://example.com/actual-link"
          textToDisplay="Custom display text"
        />
      )

      expect(screen.getByRole('textbox')).toHaveValue('Custom display text')
    })

    it('should render with custom className', () => {
      render(<CopyInput {...defaultProps} className="custom-class" />)

      const container = screen
        .getByRole('textbox')
        .closest('div')?.parentElement
      expect(container).toHaveClass('custom-class')
    })

    it('should generate unique IDs when not provided', () => {
      const { rerender } = render(<CopyInput {...defaultProps} />)
      const firstInput = screen.getByRole('textbox')
      const firstId = firstInput.id

      rerender(<CopyInput {...defaultProps} />)
      const secondInput = screen.getByRole('textbox')
      const secondId = secondInput.id

      expect(firstId).not.toBe(secondId)
    })

    it('should use provided IDs when available', () => {
      render(
        <CopyInput
          {...defaultProps}
          inputId="custom-input-id"
          inputLabel="Custom Label"
        />
      )

      const input = screen.getByRole('textbox')
      const group = screen.getByRole('group')

      expect(input).toHaveAttribute('id', 'custom-input-id')
      expect(group).toHaveAttribute('aria-labelledby', 'custom-input-id-label')
    })
  })

  describe('Button functionality', () => {
    it('should call onClick callback when provided', async () => {
      const onClick = vi.fn()
      const user = userEvent.setup()
      render(<CopyInput {...defaultProps} onClick={onClick} />)

      const copyButton = screen.getByRole('button')
      await user.click(copyButton)

      expect(onClick).toHaveBeenCalledTimes(1)
    })

    it('should render share button when canShare is true and share is available', () => {
      // Mock navigator.share to be available
      Object.defineProperty(navigator, 'share', {
        value: vi.fn(),
        writable: true,
      })

      render(<CopyInput {...defaultProps} canShare={true} />)

      const shareButton = screen.getByRole('button')
      expect(shareButton).toHaveTextContent('Partager')
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(<CopyInput {...defaultProps} />)

      const button = screen.getByRole('button')
      const input = screen.getByRole('textbox')

      expect(button).toHaveAttribute(
        'aria-label',
        'Copier le lien dans le presse-papiers'
      )
      expect(button).toHaveAttribute('aria-describedby')
      expect(button).toHaveAttribute('aria-live', 'polite')
      expect(input).toHaveAttribute('readonly')
    })

    it('should have proper ARIA attributes for share mode', () => {
      // Mock navigator.share to be available
      Object.defineProperty(navigator, 'share', {
        value: vi.fn(),
        writable: true,
      })

      render(<CopyInput {...defaultProps} canShare={true} />)

      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('aria-label', 'Partager le lien')
    })

    it('should have proper group role and labelling', () => {
      render(<CopyInput {...defaultProps} />)

      const group = screen.getByRole('group')
      const input = screen.getByRole('textbox')
      const label = screen.getByText('Lien à copier')

      expect(group).toHaveAttribute('aria-labelledby', `${input.id}-label`)
      expect(label).toHaveAttribute('id', `${input.id}-label`)
      expect(label).toHaveAttribute('for', input.id)
    })

    it('should have proper status area for screen readers', () => {
      render(<CopyInput {...defaultProps} />)

      const statusArea = screen.getByRole('group').nextElementSibling
      expect(statusArea).toHaveAttribute('aria-live', 'polite')
      expect(statusArea).toHaveAttribute('aria-atomic', 'true')
    })
  })

  describe('Edge cases', () => {
    it('should handle empty textToCopy', () => {
      render(<CopyInput textToCopy="" />)

      expect(screen.getByRole('textbox')).toHaveValue('')
      expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('should handle undefined textToDisplay', () => {
      render(<CopyInput textToCopy="test" textToDisplay={undefined} />)

      expect(screen.getByRole('textbox')).toHaveValue('test')
    })

    it('should handle custom input label', () => {
      render(<CopyInput {...defaultProps} inputLabel="Custom Input Label" />)

      const label = screen.getByText('Custom Input Label')
      expect(label).toBeInTheDocument()
    })
  })

  describe('Component structure', () => {
    it('should have proper DOM structure', () => {
      render(<CopyInput {...defaultProps} />)

      // Check main container
      const mainContainer = screen
        .getByRole('textbox')
        .closest('div')?.parentElement
      expect(mainContainer).toHaveClass('flex', 'flex-col')

      // Check input group
      const group = screen.getByRole('group')
      expect(group).toHaveClass('flex')

      // Check input
      const input = screen.getByRole('textbox')
      expect(input).toHaveClass('hidden', 'md:block')

      // Check button
      const button = screen.getByRole('button')
      expect(button).toHaveClass('min-w-[9rem]!')
    })

    it('should have proper button states', () => {
      render(<CopyInput {...defaultProps} />)

      const button = screen.getByRole('button')

      // Initial state
      expect(button).not.toBeDisabled()
      expect(button).toHaveAttribute('aria-busy', 'false')
    })
  })
})
