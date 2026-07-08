import { act, renderHook } from '@testing-library/react'
import { type Dispatch } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { AuthEvent } from '../../authMachine'
import { useAuthCodeCreation } from '../useAuthCodeCreation'

vi.mock('../useCreateVerificationCode', () => ({
  useCreateVerificationCode: vi.fn(),
}))

import { useCreateVerificationCode } from '../useCreateVerificationCode'

describe('useAuthCodeCreation', () => {
  const mockDispatch = vi.fn() as unknown as Dispatch<AuthEvent>
  const mockOnRegisterVerification = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  function setupMock(
    overrides: Partial<ReturnType<typeof useCreateVerificationCode>> = {}
  ) {
    const defaultReturn = {
      createVerificationCode: vi.fn().mockResolvedValue(undefined),
      createVerificationCodeError: false as const,
      createVerificationCodePending: false,
      resetVerificationCode: vi.fn(),
      ...overrides,
    }
    vi.mocked(useCreateVerificationCode).mockReturnValue(
      defaultReturn as ReturnType<typeof useCreateVerificationCode>
    )
    return defaultReturn
  }

  it('dispatches SUBMIT_EMAIL then calls createVerificationCode on sendEmail', async () => {
    const mockCreate = vi.fn().mockResolvedValue(undefined)
    setupMock({ createVerificationCode: mockCreate })

    const { result } = renderHook(() =>
      useAuthCodeCreation({
        dispatch: mockDispatch,
        onRegisterVerification: mockOnRegisterVerification,
      })
    )

    await act(async () => {
      await result.current.sendEmail('user@example.com')
    })

    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'SUBMIT_EMAIL',
      email: 'user@example.com',
    })
    expect(mockCreate).toHaveBeenCalledWith('user@example.com')
  })

  it('dispatches RESEND_CODE then calls createVerificationCode on resendCode', async () => {
    const mockCreate = vi.fn().mockResolvedValue(undefined)
    setupMock({ createVerificationCode: mockCreate })

    const { result } = renderHook(() =>
      useAuthCodeCreation({
        dispatch: mockDispatch,
        onRegisterVerification: mockOnRegisterVerification,
      })
    )

    await act(async () => {
      await result.current.resendCode('user@example.com')
    })

    expect(mockDispatch).toHaveBeenCalledWith({ type: 'RESEND_CODE' })
    expect(mockCreate).toHaveBeenCalledWith('user@example.com')
  })

  it('dispatches EMAIL_ERROR when sendEmail fails', async () => {
    setupMock({
      createVerificationCode: vi.fn().mockRejectedValue(new Error('fail')),
    })

    const { result } = renderHook(() =>
      useAuthCodeCreation({
        dispatch: mockDispatch,
        onRegisterVerification: mockOnRegisterVerification,
      })
    )

    await act(async () => {
      await result.current.sendEmail('user@example.com')
    })

    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'SUBMIT_EMAIL',
      email: 'user@example.com',
    })
    expect(mockDispatch).toHaveBeenCalledWith({ type: 'EMAIL_ERROR' })
  })

  it('dispatches CODE_RESEND_ERROR when resendCode fails', async () => {
    setupMock({
      createVerificationCode: vi.fn().mockRejectedValue(new Error('fail')),
    })

    const { result } = renderHook(() =>
      useAuthCodeCreation({
        dispatch: mockDispatch,
        onRegisterVerification: mockOnRegisterVerification,
      })
    )

    await act(async () => {
      await result.current.resendCode('user@example.com')
    })

    expect(mockDispatch).toHaveBeenCalledWith({ type: 'RESEND_CODE' })
    expect(mockDispatch).toHaveBeenCalledWith({ type: 'CODE_RESEND_ERROR' })
  })

  it('exposes isCreatingCode from the mutation pending state', () => {
    setupMock({ createVerificationCodePending: true })

    const { result } = renderHook(() =>
      useAuthCodeCreation({
        dispatch: mockDispatch,
        onRegisterVerification: mockOnRegisterVerification,
      })
    )

    expect(result.current.isCreatingCode).toBe(true)
  })
})
