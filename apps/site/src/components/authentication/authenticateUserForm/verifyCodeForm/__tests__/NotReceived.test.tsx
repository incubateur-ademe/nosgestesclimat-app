import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useAuth } from '@/components/authentication/AuthProvider'
import type { AuthContextValue } from '@/components/authentication/AuthProvider'
import NotReceived from '../NotReceived'

vi.mock('@/components/authentication/AuthProvider', async () => {
  const actual = await vi.importActual('@/components/authentication/AuthProvider')
  return { ...actual, useAuth: vi.fn() }
})
vi.mock('@/components/authentication/_hooks/useSecondsLeft', () => ({
  useSecondsLeft: vi.fn(() => 0),
}))

const defaultAuth: AuthContextValue = {
  state: { phase: 'idle', emailError: null },
  sendEmail: vi.fn() as unknown as AuthContextValue['sendEmail'],
  submitCode: vi.fn(),
  resendCode: vi.fn() as unknown as AuthContextValue['resendCode'],
  goBack: vi.fn(),
  reset: vi.fn(),
  clearCodeError: vi.fn(),
  isCreatingCode: false,
  mode: undefined,
}

describe('NotReceived', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useAuth).mockReturnValue({
      ...defaultAuth,
      state: {
        phase: 'code_sent',
        email: 'a@b.com',
        pending: { email: 'a@b.com', expirationDate: new Date() },
        cooldownUntil: 0,
        isResending: false,
        codeError: null,
        resendError: null,
      },
    } as AuthContextValue)
  })

  it('renders the title and instructions', () => {
    render(<NotReceived />)
    expect(
      screen.getByText("Vous n'avez pas reçu de code ?")
    ).toBeInTheDocument()
  })

  it('renders the resend button when there is no error', () => {
    render(<NotReceived />)
    expect(screen.getByText('Renvoyer le code')).toBeInTheDocument()
  })

  it('hides resend button and shows error when resendError is set', () => {
    vi.mocked(useAuth).mockReturnValue({
      ...defaultAuth,
      state: {
        phase: 'code_sent',
        email: 'a@b.com',
        pending: { email: 'a@b.com', expirationDate: new Date() },
        cooldownUntil: 0,
        isResending: false,
        codeError: null,
        resendError: { _tag: 'unknown' },
      },
    } as AuthContextValue)

    render(<NotReceived />)
    expect(screen.queryByText('Renvoyer le code')).not.toBeInTheDocument()
    expect(
      screen.getByText(
        "Oups, une erreur s'est produite au moment de l'envoi de votre code..."
      )
    ).toBeInTheDocument()
    expect(screen.getByText('Recharger la page')).toBeInTheDocument()
  })

  it('returns null when not in a verify phase', () => {
    vi.mocked(useAuth).mockReturnValue(defaultAuth)
    const { container } = render(<NotReceived />)
    expect(container.innerHTML).toBe('')
  })
})
