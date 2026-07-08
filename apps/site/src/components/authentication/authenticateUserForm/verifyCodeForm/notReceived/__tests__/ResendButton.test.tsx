import { trackPosthogEvent } from '@/utils/analytics/trackEvent'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import ResendButton from '../ResendButton'

vi.mock('@/utils/analytics/trackEvent')

describe('ResendButton', () => {
  const mockOnResend = vi.fn().mockResolvedValue(undefined)

  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers({ shouldAdvanceTime: true })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  function renderComponent(
    props: Partial<React.ComponentProps<typeof ResendButton>> = {}
  ) {
    const defaultProps: React.ComponentProps<typeof ResendButton> = {
      isRetryButtonDisabled: false,
      onResendVerificationCode: mockOnResend,
      timeLeft: 0,
      ...props,
    }

    return render(<ResendButton {...defaultProps} />)
  }

  it('renders the resend button in its default state', () => {
    renderComponent()
    expect(screen.getByText('Renvoyer le code')).toBeInTheDocument()
  })

  it('is disabled and shows a lock icon when isRetryButtonDisabled is true', () => {
    renderComponent({ isRetryButtonDisabled: true, timeLeft: 15 })
    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('aria-disabled', 'true')
    expect(
      screen.getByText(
        'signIn.verificationForm.notReceived.resendButton.timeLeft'
      )
    ).toBeInTheDocument()
  })

  it('calls onResendVerificationCode and shows confirmation on click', async () => {
    renderComponent()
    const button = screen.getByRole('button')
    await userEvent.click(button)

    await waitFor(() => {
      expect(mockOnResend).toHaveBeenCalledTimes(1)
    })

    // Confirmation message should appear
    expect(screen.getByText('Code renvoyé')).toBeInTheDocument()
  })

  it('tracks the resend click via PostHog', async () => {
    const mockTrack = vi.mocked(trackPosthogEvent)
    renderComponent()
    const button = screen.getByRole('button')
    await userEvent.click(button)

    await waitFor(() => {
      expect(mockTrack).toHaveBeenCalled()
    })
  })

  it('hides the confirmation message after 4 seconds', async () => {
    renderComponent()
    const button = screen.getByRole('button')
    await userEvent.click(button)

    await waitFor(() => {
      expect(screen.getByText('Code renvoyé')).toBeInTheDocument()
    })

    vi.advanceTimersByTime(4000)

    await waitFor(() => {
      expect(screen.queryByText('Code renvoyé')).not.toBeInTheDocument()
    })
  })

  it('does nothing when clicked while disabled', async () => {
    renderComponent({ isRetryButtonDisabled: true, timeLeft: 10 })
    const button = screen.getByRole('button')
    await userEvent.click(button)

    expect(mockOnResend).not.toHaveBeenCalled()
  })
})
