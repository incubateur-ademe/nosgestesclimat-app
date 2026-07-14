import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { AuthEvent, AuthPhase } from '../../authMachine'
import { useAuthLogin } from '../useAuthLogin'

vi.mock('../useLogin', () => ({
  useLogin: vi.fn(),
}))

import { useLogin } from '../useLogin'

describe('useAuthLogin', () => {
  const mockDispatch = vi.fn() as React.Dispatch<AuthEvent>
  const mockCompleteVerification = vi.fn().mockResolvedValue(undefined)
  const mockResetCodeCreation = vi.fn()

  const pendingVerification = {
    email: 'user@example.com',
    expirationDate: new Date('2025-01-01'),
  }

  const codeSentState: AuthPhase = {
    phase: 'code_sent',
    email: 'user@example.com',
    pendingVerification,
  }

  const verifyingCodeState: AuthPhase = {
    phase: 'verifying_code',
    email: 'user@example.com',
    code: '123456',
    pendingVerification,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  function setupMock(
    overrides: Partial<ReturnType<typeof useLogin>> = {}
  ): ReturnType<typeof useLogin> {
    const defaultReturn: ReturnType<typeof useLogin> = {
      mutateAsync: vi.fn().mockResolvedValue({ userId: 'user-123' }),
      error: null,
      reset: vi.fn(),
      ...overrides,
    } as unknown as ReturnType<typeof useLogin>

    vi.mocked(useLogin).mockReturnValue(defaultReturn)
    return defaultReturn
  }

  it('dispatches SUBMIT_CODE when verifyCode is called', () => {
    setupMock()

    const { result } = renderHook(() =>
      useAuthLogin({
        state: codeSentState,
        dispatch: mockDispatch,
        completeVerification: mockCompleteVerification,
        resetCodeCreation: mockResetCodeCreation,
      })
    )

    act(() => {
      result.current.verifyCode('123456')
    })

    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'SUBMIT_CODE',
      code: '123456',
    })
  })

  it('calls login and dispatches CODE_VALID when entering verifying_code', async () => {
    const login = setupMock()

    renderHook(() =>
      useAuthLogin({
        state: verifyingCodeState,
        dispatch: mockDispatch,
        completeVerification: mockCompleteVerification,
        resetCodeCreation: mockResetCodeCreation,
      })
    )

    await waitFor(() => {
      expect(login.mutateAsync).toHaveBeenCalledWith({
        email: 'user@example.com',
        code: '123456',
      })
    })

    await waitFor(() => {
      expect(mockDispatch).toHaveBeenCalledWith({
        type: 'CODE_VALID',
        userId: 'user-123',
      })
    })

    expect(mockCompleteVerification).not.toHaveBeenCalled()
  })

  it('calls completeVerification when entering authenticated', async () => {
    setupMock()

    renderHook(() =>
      useAuthLogin({
        state: {
          phase: 'authenticated',
          email: 'user@example.com',
          userId: 'user-123',
        },
        dispatch: mockDispatch,
        completeVerification: mockCompleteVerification,
        resetCodeCreation: mockResetCodeCreation,
      })
    )

    await waitFor(() => {
      expect(mockCompleteVerification).toHaveBeenCalledWith('user-123')
    })
  })

  it('dispatches CODE_INVALID when login fails in verifying_code', async () => {
    setupMock({
      mutateAsync: vi.fn().mockRejectedValue(new Error('Invalid code')),
    })

    renderHook(() =>
      useAuthLogin({
        state: verifyingCodeState,
        dispatch: mockDispatch,
        completeVerification: mockCompleteVerification,
        resetCodeCreation: mockResetCodeCreation,
      })
    )

    await waitFor(() => {
      expect(mockDispatch).toHaveBeenCalledWith({ type: 'CODE_INVALID' })
    })

    expect(mockCompleteVerification).not.toHaveBeenCalled()
  })

  it('does not call login when not in verifying_code', async () => {
    const login = setupMock()

    renderHook(() =>
      useAuthLogin({
        state: codeSentState,
        dispatch: mockDispatch,
        completeVerification: mockCompleteVerification,
        resetCodeCreation: mockResetCodeCreation,
      })
    )

    await waitFor(() => {
      expect(login.mutateAsync).not.toHaveBeenCalled()
    })
  })

  it('resets the login mutation, resets code creation and dispatches GO_BACK on goBack', () => {
    const login = setupMock()
    const { result } = renderHook(() =>
      useAuthLogin({
        state: codeSentState,
        dispatch: mockDispatch,
        completeVerification: mockCompleteVerification,
        resetCodeCreation: mockResetCodeCreation,
      })
    )

    act(() => {
      result.current.goBack()
    })

    expect(login.reset).toHaveBeenCalled()
    expect(mockResetCodeCreation).toHaveBeenCalled()
    expect(mockDispatch).toHaveBeenCalledWith({ type: 'GO_BACK' })
  })

  it('dispatches RESET on reset', () => {
    const { result } = renderHook(() =>
      useAuthLogin({
        state: codeSentState,
        dispatch: mockDispatch,
        completeVerification: mockCompleteVerification,
        resetCodeCreation: mockResetCodeCreation,
      })
    )

    act(() => {
      result.current.reset()
    })

    expect(mockDispatch).toHaveBeenCalledWith({ type: 'RESET' })
  })

  it('resets the login mutation on clearLoginError', () => {
    const login = setupMock()
    const { result } = renderHook(() =>
      useAuthLogin({
        state: codeSentState,
        dispatch: mockDispatch,
        completeVerification: mockCompleteVerification,
        resetCodeCreation: mockResetCodeCreation,
      })
    )

    act(() => {
      result.current.clearLoginError()
    })

    expect(login.reset).toHaveBeenCalled()
  })

  it('exposes the raw login error from the mutation', () => {
    const networkError = new Error('Network error')
    setupMock({ error: networkError })

    const { result } = renderHook(() =>
      useAuthLogin({
        state: codeSentState,
        dispatch: mockDispatch,
        completeVerification: mockCompleteVerification,
        resetCodeCreation: mockResetCodeCreation,
      })
    )

    expect(result.current.loginError).toBe(networkError)
  })
})
