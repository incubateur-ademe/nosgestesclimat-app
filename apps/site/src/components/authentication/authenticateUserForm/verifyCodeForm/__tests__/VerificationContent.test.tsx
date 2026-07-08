import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import VerificationContent from '../VerificationContent'

describe('VerificationContent', () => {
  function renderComponent(props: Partial<React.ComponentProps<typeof VerificationContent>> = {}) {
    const defaultProps: React.ComponentProps<typeof VerificationContent> = {
      email: 'user@example.com',
      inputError: undefined,
      isSuccessValidate: false,
      isPendingValidate: false,
      handleValidateVerificationCode: vi.fn(),
      isInputDisabled: false,
      onInputChange: vi.fn(),
      ...props,
    }

    return render(<VerificationContent {...defaultProps} />)
  }

  it('renders the email address', () => {
    renderComponent()
    expect(screen.getByText('user@example.com')).toBeInTheDocument()
  })

  it('renders the verification code input', () => {
    renderComponent()
    expect(screen.getByTestId('verification-code-input')).toBeInTheDocument()
  })

  it('displays an error message when inputError is provided', () => {
    renderComponent({ inputError: 'Invalid code' })
    expect(screen.getByText('Le code est invalide')).toBeInTheDocument()
  })

  it('displays the pending state when isPendingValidate is true', () => {
    renderComponent({ isPendingValidate: true })
    expect(screen.getByText('Nous vérifions votre code...')).toBeInTheDocument()
  })

  it('displays the success state when isSuccessValidate is true', () => {
    renderComponent({ isSuccessValidate: true })
    expect(screen.getByText('Votre code est valide !')).toBeInTheDocument()
  })

  it('disables the input when isInputDisabled is true', () => {
    renderComponent({ isInputDisabled: true })
    const input = screen.getByTestId('verification-code-input')
    expect(input).toBeDisabled()
  })
})
