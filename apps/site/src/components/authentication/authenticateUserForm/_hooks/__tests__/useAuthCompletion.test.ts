import { useCookieManagement } from '@/components/cookies/useCookieManagement'
import { useUser } from '@/publicodes-state'
import { trackPosthogEvent } from '@/utils/analytics/trackEvent'
import { safeSessionStorage } from '@/utils/browser/safeSessionStorage'
import { act, renderHook, waitFor } from '@testing-library/react'
import { useRouter } from 'next/navigation'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { AuthEvent } from '../../authMachine'
import { useAuthCompletion } from '../useAuthCompletion'

vi.mock('@/utils/browser/safeSessionStorage')
vi.mock('@/utils/analytics/trackEvent')

vi.mock('@/publicodes-state', () => ({
  useUser: vi.fn(),
}))

vi.mock('@/components/cookies/useCookieManagement', () => ({
  useCookieManagement: vi.fn(),
}))

vi.mock('@/helpers/user/reconcileOnAuth', () => ({
  reconcileUserOnAuth: vi.fn(),
}))

describe('useAuthCompletion', () => {
  const mockDispatch = vi.fn() as React.Dispatch<AuthEvent>
  const mockOnComplete = vi.fn().mockResolvedValue(undefined)

  beforeEach(() => {
    vi.clearAllMocks()

    // Default: no pending verification, so the restore effect stays silent.
    vi.mocked(useUser).mockReturnValue({
      pendingVerification: null,
      updatePendingVerification: vi.fn(),
    } as any)

    vi.mocked(useCookieManagement).mockReturnValue({
      cookieState: 'test-cookies',
    } as any)
  })

  function mockRouter() {
    const mockPush = vi.fn()
    const mockRefresh = vi.fn()

    vi.mocked(useRouter).mockReturnValue({
      push: mockPush,
      refresh: mockRefresh,
      replace: vi.fn(),
      back: vi.fn(),
      prefetch: vi.fn(),
      forward: vi.fn(),
    } as any)

    return { mockPush, mockRefresh }
  }

  function setPendingVerification() {
    // Must be future-dated or the usePendingVerification hook will discard it
    vi.mocked(useUser).mockReturnValue({
      pendingVerification: {
        email: 'user@example.com',
        expirationDate: new Date('2099-12-31'),
      },
      updatePendingVerification: vi.fn(),
    } as any)
  }

  it('clears sessionStorage, dispatches FINALIZE, calls onComplete, redirects and refreshes on handleComplete', async () => {
    const mockRemoveItem = vi.mocked(safeSessionStorage.removeItem)
    const mockTrack = vi.mocked(trackPosthogEvent)
    const { mockPush, mockRefresh } = mockRouter()

    setPendingVerification()

    const { result } = renderHook(() =>
      useAuthCompletion({
        dispatch: mockDispatch,
        onComplete: mockOnComplete,
        redirectPathname: '/dashboard',
        tracker: { eventName: 'user_authenticated' },
      })
    )

    await act(async () => {
      await result.current.completeVerification('user-123')
    })

    expect(mockRemoveItem).toHaveBeenCalledWith('email-pending-authentication')
    expect(mockTrack).toHaveBeenCalledWith({ eventName: 'user_authenticated' })
    expect(mockDispatch).toHaveBeenCalledWith({ type: 'FINALIZE' })
    expect(mockOnComplete).toHaveBeenCalledWith({
      email: expect.any(String),
      userId: 'user-123',
    })
    expect(mockPush).toHaveBeenCalledWith('/dashboard')
    expect(mockRefresh).toHaveBeenCalled()
  })

  it('does not redirect when redirectPathname is not provided', async () => {
    const { mockPush, mockRefresh } = mockRouter()

    setPendingVerification()

    const { result } = renderHook(() =>
      useAuthCompletion({
        dispatch: mockDispatch,
        onComplete: mockOnComplete,
      })
    )

    await act(async () => {
      await result.current.completeVerification('user-123')
    })

    expect(mockPush).not.toHaveBeenCalled()
    expect(mockRefresh).toHaveBeenCalled()
  })

  it('does not track when tracker is not provided', async () => {
    const mockTrack = vi.mocked(trackPosthogEvent)
    mockRouter()

    setPendingVerification()

    const { result } = renderHook(() =>
      useAuthCompletion({
        dispatch: mockDispatch,
        onComplete: mockOnComplete,
      })
    )

    await act(async () => {
      await result.current.completeVerification('user-123')
    })

    expect(mockTrack).not.toHaveBeenCalled()
  })

  it('restores pending verification on mount by dispatching EMAIL_SENT exactly once', async () => {
    const pendingVerification = {
      email: 'user@example.com',
      expirationDate: new Date('2099-12-31'),
    }

    vi.mocked(useUser).mockReturnValue({
      pendingVerification,
      updatePendingVerification: vi.fn(),
    } as any)

    const { rerender } = renderHook(() =>
      useAuthCompletion({
        dispatch: mockDispatch,
      })
    )

    await waitFor(() => {
      expect(mockDispatch).toHaveBeenCalledWith({
        type: 'EMAIL_SENT',
        pendingVerification,
      })
    })

    expect(mockDispatch).toHaveBeenCalledTimes(1)

    // Re-render should not trigger another dispatch (hasRestored ref guard)
    rerender()
    expect(mockDispatch).toHaveBeenCalledTimes(1)
  })

  it('does not restore pending verification when there is none', async () => {
    // pendingVerification is null by default (set in beforeEach)
    renderHook(() =>
      useAuthCompletion({
        dispatch: mockDispatch,
      })
    )

    // Wait a tick to allow any effects to run
    await new Promise((resolve) => setTimeout(resolve, 0))

    expect(mockDispatch).not.toHaveBeenCalled()
  })
})
