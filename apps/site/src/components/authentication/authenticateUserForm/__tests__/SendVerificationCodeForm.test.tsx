import { useUser } from '@/publicodes-state'
import { safeSessionStorage } from '@/utils/browser/safeSessionStorage'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useAuthContext } from '../AuthContext'
import SendVerificationCodeForm from '../SendVerificationCodeForm'

vi.mock('../AuthContext')
vi.mock('@/publicodes-state', () => ({
  useUser: vi.fn(),
}))
vi.mock('@/utils/browser/safeSessionStorage', () => ({
  safeSessionStorage: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
  },
}))

describe('SendVerificationCodeForm', () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })

  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )
  }

  const mockSendEmail = vi.fn().mockResolvedValue(undefined)

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useAuthContext).mockReturnValue({
      sendEmail: mockSendEmail,
      state: { phase: 'idle' },
      isCreatingCode: false,
      hasEmailError: false,
    } as any)

    vi.mocked(useUser).mockReturnValue({
      user: null,
    } as any)

    vi.mocked(safeSessionStorage.getItem).mockReturnValue(null)
  })

  it('renders with a default button label and input label', () => {
    render(
      <Wrapper>
        <SendVerificationCodeForm />
      </Wrapper>
    )

    expect(
      screen.getByTestId('verification-code-email-input')
    ).toBeInTheDocument()
    // The default button label is a translation key rendered by our mock
    expect(screen.getByRole('button', { type: 'submit' })).toBeInTheDocument()
  })

  it('renders with custom buttonLabel and inputLabel', () => {
    render(
      <Wrapper>
        <SendVerificationCodeForm
          buttonLabel="Custom Button"
          inputLabel="Custom Input"
        />
      </Wrapper>
    )

    expect(screen.getByText('Custom Button')).toBeInTheDocument()
    expect(screen.getByText('Custom Input')).toBeInTheDocument()
  })

  it('shows validation error when email is empty and required is true', async () => {
    render(
      <Wrapper>
        <SendVerificationCodeForm required={true} />
      </Wrapper>
    )

    const button = screen.getByRole('button', { type: 'submit' })
    await userEvent.click(button)

    // The react-hook-form validation message should appear
    expect(
      screen.getByText('signIn.emailForm.error.required')
    ).toBeInTheDocument()
  })

  it('shows validation error when email format is invalid', async () => {
    render(
      <Wrapper>
        <SendVerificationCodeForm />
      </Wrapper>
    )

    const input = screen.getByTestId('verification-code-email-input')
    await userEvent.type(input, 'not-an-email')

    const button = screen.getByRole('button', { type: 'submit' })
    await userEvent.click(button)

    expect(
      screen.getByText('signIn.emailForm.error.invalid')
    ).toBeInTheDocument()
  })

  it('calls sendEmail with the entered email on valid submission', async () => {
    render(
      <Wrapper>
        <SendVerificationCodeForm />
      </Wrapper>
    )

    const input = screen.getByTestId('verification-code-email-input')
    await userEvent.type(input, 'user@example.com')

    const button = screen.getByRole('button', { type: 'submit' })
    await userEvent.click(button)

    expect(mockSendEmail).toHaveBeenCalledWith('user@example.com')
  })

  it('pre-fills the email from sessionStorage when available', () => {
    vi.mocked(safeSessionStorage.getItem).mockReturnValue('stored@example.com')

    render(
      <Wrapper>
        <SendVerificationCodeForm />
      </Wrapper>
    )

    const input = screen.getByTestId(
      'verification-code-email-input'
    ) as HTMLInputElement
    expect(input.value).toBe('stored@example.com')
  })

  it('pre-fills the email from the user object when sessionStorage is empty', () => {
    vi.mocked(useUser).mockReturnValue({
      user: { email: 'user@example.com' },
    } as any)

    render(
      <Wrapper>
        <SendVerificationCodeForm />
      </Wrapper>
    )

    const input = screen.getByTestId(
      'verification-code-email-input'
    ) as HTMLInputElement
    expect(input.value).toBe('user@example.com')
  })

  it('displays a server error when hasEmailError is true', () => {
    vi.mocked(useAuthContext).mockReturnValue({
      sendEmail: mockSendEmail,
      state: { phase: 'idle' },
      isCreatingCode: false,
      hasEmailError: true,
    } as any)

    render(
      <Wrapper>
        <SendVerificationCodeForm />
      </Wrapper>
    )

    expect(screen.getByTestId('submit-error-message')).toBeInTheDocument()
  })

  it('shows the loader state when isCreatingCode is true', () => {
    vi.mocked(useAuthContext).mockReturnValue({
      sendEmail: mockSendEmail,
      state: { phase: 'idle' },
      isCreatingCode: true,
      hasEmailError: false,
    } as any)

    render(
      <Wrapper>
        <SendVerificationCodeForm />
      </Wrapper>
    )

    // The Form component sets loading={true}, which renders a loader.
    // We verify by checking the button has the disabled styling (aria-disabled).
    const button = screen.getByRole('button', { type: 'submit' })
    expect(button).toHaveAttribute('aria-disabled', 'true')
  })
})
