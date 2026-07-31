import { trackPosthogEvent } from '@/utils/analytics/trackEvent'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useAuth } from '@/components/authentication/AuthProvider'
import type { AuthContextValue } from '@/components/authentication/AuthProvider'
import ResendButton from '../ResendButton'

vi.mock('@/utils/analytics/trackEvent')
vi.mock('@/components/authentication/AuthProvider', async () => {
  const actual = await vi.importActual('@/components/authentication/AuthProvider')
  return { ...actual, useAuth: vi.fn() }
})

const mockResendCode = vi.fn().mockResolvedValue(undefined)

const defaultAuth: AuthContextValue = {
  state: { phase: 'idle', emailError: null },
  sendEmail: vi.fn() as unknown as AuthContextValue['sendEmail'],
  submitCode: vi.fn(),
  resendCode: mockResendCode,
  goBack: vi.fn(),
  reset: vi.fn(),
  clearCodeError: vi.fn(),
  isCreatingCode: false,
  mode: undefined,
}

describe('ResendButton', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers({ shouldAdvanceTime: true })
    vi.mocked(useAuth).mockReturnValue({
      ...defaultAuth,
      state: { phase: 'code_sent', email: 'a@b.com' },
    } as AuthContextValue)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  function renderComponent(disabled = false, secondsLeft = 0) {
    return render(
      <ResendButton disabled={disabled} secondsLeft={secondsLeft} />
    )
  }

  it('renders the resend button in its default state', () => {
    renderComponent()
    expect(screen.getByText('Renvoyer le code')).toBeInTheDocument()
  })

  it('is disabled and shows the cooldown when disabled with secondsLeft', () => {
    renderComponent(true, 15)
    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('aria-disabled', 'true')
    expect(
      screen.getByText(
        'signIn.verificationForm.notReceived.resendButton.timeLeft'
      )
    ).toBeInTheDocument()
  })

  it('calls resendCode and shows confirmation on click', async () => {
    renderComponent()
    const button = screen.getByRole('button')
    await userEvent.click(button)

    await waitFor(() => {
      expect(mockResendCode).toHaveBeenCalledTimes(1)
    })
    expect(screen.getByText('Code renvoyé')).toBeInTheDocument()
  })

  it('tracks the resend click via PostHog', async () => {
    const mockTrack = vi.mocked(trackPosthogEvent)
    renderComponent()
    await userEvent.click(screen.getByRole('button'))

    await waitFor(() => {
      expect(mockTrack).toHaveBeenCalled()
    })
  })

  it('hides the confirmation message after 4 seconds', async () => {
    renderComponent()
    await userEvent.click(screen.getByRole('button'))

    await waitFor(() => {
      expect(screen.getByText('Code renvoyé')).toBeInTheDocument()
    })
    vi.advanceTimersByTime(4000)

    await waitFor(() => {
      expect(screen.queryByText('Code renvoyé')).not.toBeInTheDocument()
    })
  })

  it('does nothing when clicked while disabled', async () => {
    renderComponent(true, 10)
    await userEvent.click(screen.getByRole('button'))

    expect(mockResendCode).not.toHaveBeenCalled()
  })
})
