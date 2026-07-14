import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
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
    expect(
      screen.getByTestId('verification-code-submit-button')
    ).toHaveAttribute('aria-disabled', 'true')
    expect(screen.getByText('Nous vérifions votre code...')).toBeInTheDocument()
  })

  it('displays the success state when isSuccessValidate is true', () => {
    renderComponent({ isSuccessValidate: true })
    expect(screen.getByText('Votre code est valide !')).toBeInTheDocument()
  })

  it('disables the submit button until 6 digits are entered', async () => {
    renderComponent()

    expect(screen.getByTestId('verification-code-submit-button')).toHaveAttribute(
      'aria-disabled',
      'true'
    )

    await userEvent.type(screen.getByTestId('verification-code-input'), '123456')

    expect(screen.getByTestId('verification-code-submit-button')).not.toHaveAttribute(
      'aria-disabled',
      'true'
    )
  })
})
