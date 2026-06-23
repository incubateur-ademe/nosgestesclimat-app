import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { withMinimumDuration } from '../with-minimum-duration.ts'

describe('withMinimumDuration', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  test('Then it pads a fast task up to the minimum duration', async () => {
    const promise = withMinimumDuration({ minMs: 100 }, () =>
      Promise.resolve('ok')
    )
    const settled = trackSettled(promise)

    await vi.advanceTimersByTimeAsync(99)
    expect(settled.isSettled).toBe(false)

    await vi.advanceTimersByTimeAsync(1)
    expect(settled.isSettled).toBe(true)
    await expect(promise).resolves.toBe('ok')
  })

  test('Then it does not further delay a task slower than the minimum', async () => {
    const promise = withMinimumDuration({ minMs: 50 }, () => sleep(200))
    const settled = trackSettled(promise)

    await vi.advanceTimersByTimeAsync(199)
    expect(settled.isSettled).toBe(false)

    await vi.advanceTimersByTimeAsync(1)
    expect(settled.isSettled).toBe(true)
  })

  test('Then it pads the minimum duration even when the task throws', async () => {
    const error = new Error('boom')

    const promise = withMinimumDuration({ minMs: 100 }, () => {
      throw error
    })
    const settled = trackSettled(promise)

    await vi.advanceTimersByTimeAsync(99)
    expect(settled.isSettled).toBe(false)

    await vi.advanceTimersByTimeAsync(1)
    expect(settled.isSettled).toBe(true)
    await expect(promise).rejects.toBe(error)
  })

  test('Then the padding never resolves below the minimum with jitter', async () => {
    // Lowest possible jitter draw keeps the target at the bare minimum.
    vi.spyOn(Math, 'random').mockReturnValue(0)

    const promise = withMinimumDuration({ minMs: 80, jitterMs: 40 }, () =>
      Promise.resolve('ok')
    )
    const settled = trackSettled(promise)

    await vi.advanceTimersByTimeAsync(79)
    expect(settled.isSettled).toBe(false)

    await vi.advanceTimersByTimeAsync(1)
    expect(settled.isSettled).toBe(true)
  })

  test('Then it adds jitter on top of the minimum duration', async () => {
    // Highest draw maps to the full jitter window: 80 + floor(0.999 * 41) = 120.
    vi.spyOn(Math, 'random').mockReturnValue(0.999)

    const promise = withMinimumDuration({ minMs: 80, jitterMs: 40 }, () =>
      Promise.resolve('ok')
    )
    const settled = trackSettled(promise)

    await vi.advanceTimersByTimeAsync(119)
    expect(settled.isSettled).toBe(false)

    await vi.advanceTimersByTimeAsync(1)
    expect(settled.isSettled).toBe(true)
  })
})

const trackSettled = (promise: Promise<unknown>) => {
  const settled = { isSettled: false }
  promise.then(
    () => (settled.isSettled = true),
    () => (settled.isSettled = true)
  )
  return settled
}

const sleep = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms))
