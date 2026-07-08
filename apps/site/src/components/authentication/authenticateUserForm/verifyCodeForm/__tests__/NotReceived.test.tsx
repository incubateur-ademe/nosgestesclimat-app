import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import NotReceived from '../NotReceived'

describe('NotReceived', () => {
  function renderComponent(
    props: Partial<React.ComponentProps<typeof NotReceived>> = {}
  ) {
    const defaultProps: React.ComponentProps<typeof NotReceived> = {
      isRetryButtonDisabled: false,
      isErrorResend: false,
      onResendVerificationCode: vi.fn(),
      timeLeft: 0,
      ...props,
    }

    return render(<NotReceived {...defaultProps} />)
  }

  it('renders the title and instructions', () => {
    renderComponent()
    expect(
      screen.getByText("Vous n'avez pas reçu de code ?")
    ).toBeInTheDocument()
    expect(
      screen.getByText(
        'Vérifiez vos spams ou outils anti-spam (MailinBlack, Altospam, etc...)'
      )
    ).toBeInTheDocument()
  })

  it('renders the resend button when there is no error', () => {
    renderComponent()
    expect(screen.getByText('Renvoyer le code')).toBeInTheDocument()
  })

  it('does not render the resend button when isErrorResend is true', () => {
    renderComponent({ isErrorResend: true })
    expect(screen.queryByText('Renvoyer le code')).not.toBeInTheDocument()
  })

  it('renders the error message and reload button when isErrorResend is true', () => {
    renderComponent({ isErrorResend: true })
    expect(
      screen.getByText(
        'Oups, une erreur s\u0027est produite au moment de l\u0027envoi de votre code...'
      )
    ).toBeInTheDocument()
    expect(screen.getByText('Recharger la page')).toBeInTheDocument()
  })

  it('disables the resend button when isRetryButtonDisabled is true', () => {
    renderComponent({ isRetryButtonDisabled: true, timeLeft: 15 })
    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('aria-disabled', 'true')
  })
})
