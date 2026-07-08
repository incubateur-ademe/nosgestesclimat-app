import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AxiosError } from 'axios'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { AuthContextValue } from '../AuthContext'
import { useAuthContext } from '../AuthContext'
import VerifyCodeForm from '../VerifyCodeForm'

vi.mock('@/app/[locale]/marianne', () => ({
  marianne: { className: 'font-marianne' },
}))

vi.mock('@/hooks/organisations/useTimeleft', () => ({
  default: vi.fn(() => ({ timeLeft: 0, setTimeLeft: vi.fn() })),
}))

vi.mock('../AuthContext', () => ({
  useAuthContext: vi.fn(),
}))

describe('VerifyCodeForm', () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })

  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )
  }

  const mockVerifyCode = vi.fn().mockResolvedValue(undefined)
  const mockResendCode = vi.fn().mockResolvedValue(undefined)
  const mockClearLoginError = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers({ shouldAdvanceTime: true })

    vi.mocked(useAuthContext).mockReturnValue({
      state: {
        phase: 'code_sent',
        email: 'user@example.com',
        pendingVerification: {
          email: 'user@example.com',
          expirationDate: new Date(),
        },
      },
      verifyCode: mockVerifyCode,
      resendCode: mockResendCode,
      loginError: null,
      hasResendError: false,
      clearLoginError: mockClearLoginError,
    } as unknown as AuthContextValue)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders the email and the verification code input', () => {
    render(
      <Wrapper>
        <VerifyCodeForm email="user@example.com" />
      </Wrapper>
    )

    expect(screen.getByText('user@example.com')).toBeInTheDocument()
    expect(screen.getByTestId('verification-code-input')).toBeInTheDocument()
  })

  it('calls verifyCode with the 6-digit code when fully entered', async () => {
    render(
      <Wrapper>
        <VerifyCodeForm email="user@example.com" />
      </Wrapper>
    )

    const input = screen.getByTestId('verification-code-input')
    await userEvent.type(input, '123456')

    await waitFor(() => {
      expect(mockVerifyCode).toHaveBeenCalledWith('123456', 'user@example.com')
    })
  })

  it('shows an error message when loginError is an AxiosError with invalid code', () => {
    const axiosError = new AxiosError()
    axiosError.response = {
      data: { message: 'Forbidden ! Invalid verification code.' },
      status: 403,
      statusText: 'Forbidden',
      headers: {},
      config: {} as unknown as AxiosError['config'],
    }

    vi.mocked(useAuthContext).mockReturnValue({
      state: {
        phase: 'code_sent',
        email: 'user@example.com',
        pendingVerification: {
          email: 'user@example.com',
          expirationDate: new Date(),
        },
      },
      verifyCode: mockVerifyCode,
      resendCode: mockResendCode,
      loginError: axiosError,
      hasResendError: false,
      clearLoginError: mockClearLoginError,
    } as unknown as AuthContextValue)

    render(
      <Wrapper>
        <VerifyCodeForm email="user@example.com" />
      </Wrapper>
    )

    expect(screen.getByText('Le code est invalide')).toBeInTheDocument()
  })

  it('shows a generic error message when loginError is an unknown AxiosError', () => {
    const axiosError = new AxiosError()
    axiosError.response = {
      data: { message: 'Something else' },
      status: 500,
      statusText: 'Server Error',
      headers: {},
      config: {} as unknown as AxiosError['config'],
    }

    vi.mocked(useAuthContext).mockReturnValue({
      state: {
        phase: 'code_sent',
        email: 'user@example.com',
        pendingVerification: {
          email: 'user@example.com',
          expirationDate: new Date(),
        },
      },
      verifyCode: mockVerifyCode,
      resendCode: mockResendCode,
      loginError: axiosError,
      hasResendError: false,
      clearLoginError: mockClearLoginError,
    } as unknown as AuthContextValue)

    render(
      <Wrapper>
        <VerifyCodeForm email="user@example.com" />
      </Wrapper>
    )

    expect(screen.getByText('Le code est invalide')).toBeInTheDocument()
  })

  it('calls clearLoginError when the input has fewer than 6 characters', async () => {
    render(
      <Wrapper>
        <VerifyCodeForm email="user@example.com" />
      </Wrapper>
    )

    const input = screen.getByTestId('verification-code-input')
    await userEvent.type(input, '12')

    await waitFor(() => {
      expect(mockClearLoginError).toHaveBeenCalled()
    })
  })

  it('calls resendCode when the resend button is clicked', async () => {
    render(
      <Wrapper>
        <VerifyCodeForm email="user@example.com" />
      </Wrapper>
    )

    const resendButton = screen.getByRole('button', {
      name: /renvoyer le code/i,
    })
    await userEvent.click(resendButton)

    await waitFor(() => {
      expect(mockResendCode).toHaveBeenCalledWith('user@example.com')
    })
  })
})
