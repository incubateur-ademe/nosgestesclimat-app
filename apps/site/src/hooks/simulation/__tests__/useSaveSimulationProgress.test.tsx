import type { Simulation } from '@/helpers/server/model/simulations'
import type { DottedName } from '@incubateur-ademe/nosgestesclimat'
import { act, renderHook } from '@testing-library/react'
import type { PropsWithChildren } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  SaveSimulationProgressProvider,
  useSaveSimulationProgress,
} from '../useSaveSimulationProgress'

const mockUseCurrentSimulation = vi.fn()
const mockUseFormState = vi.fn()

vi.mock('@/publicodes-state', () => ({
  useCurrentSimulation: () => mockUseCurrentSimulation(),
  useFormState: () => mockUseFormState(),
}))

const mockSaveSimulation = vi.fn()
vi.mock('../useSaveSimulation', () => ({
  useSaveSimulation: () => ({ saveSimulation: mockSaveSimulation }),
}))

const mockCaptureException = vi.fn()
const mockSetExtra = vi.fn()
vi.mock('@sentry/nextjs', () => ({
  captureException: (error: unknown) => mockCaptureException(error),
  setExtra: (key: string, value: unknown) => mockSetExtra(key, value),
}))

const A_QUESTION = 'transport . voiture . km' as DottedName
const ANOTHER_QUESTION = 'logement . surface' as DottedName

const aSimulation = (overrides: Partial<Simulation> = {}): Simulation =>
  ({
    id: 'simulation-id',
    model: 'FR-fr-1.2.3',
    situation: { [A_QUESTION]: 10000 },
    extendedSituation: {
      [A_QUESTION]: { source: 'answered', nodeValue: 10000 },
    },
    foldedSteps: [A_QUESTION],
    progression: 0.5,
    computedResults: { carbone: { bilan: 1 } },
    ...overrides,
  }) as unknown as Simulation

const wrapper = ({ children }: PropsWithChildren) => (
  <SaveSimulationProgressProvider>{children}</SaveSimulationProgressProvider>
)

const renderSaveHook = () =>
  renderHook(() => useSaveSimulationProgress(), { wrapper })

// Saves are queued through a promise chain, so the server action is called in a
// microtask rather than synchronously with the request.
const flushSaveQueue = () =>
  act(async () => {
    await Promise.resolve()
  })

describe('useSaveSimulationProgress', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSaveSimulation.mockResolvedValue(undefined)
    mockUseCurrentSimulation.mockReturnValue(aSimulation())
    mockUseFormState.mockReturnValue({ progression: 0.5 })
  })

  it('should not save when the simulation changes without a request', async () => {
    const { rerender } = renderSaveHook()

    mockUseCurrentSimulation.mockReturnValue(
      aSimulation({ foldedSteps: [A_QUESTION, ANOTHER_QUESTION] })
    )
    act(() => rerender())
    await flushSaveQueue()

    expect(mockSaveSimulation).not.toHaveBeenCalled()
  })

  it('should save once when a request follows a change', async () => {
    const { result } = renderSaveHook()

    mockUseCurrentSimulation.mockReturnValue(
      aSimulation({ foldedSteps: [A_QUESTION, ANOTHER_QUESTION] })
    )
    act(() => result.current.requestSaveSimulationProgress())
    await flushSaveQueue()

    expect(mockSaveSimulation).toHaveBeenCalledTimes(1)
    expect(mockSaveSimulation).toHaveBeenCalledWith(
      expect.objectContaining({
        simulation: expect.objectContaining({
          id: 'simulation-id',
          model: 'FR-fr-1.2.3',
          foldedSteps: [A_QUESTION, ANOTHER_QUESTION],
        }),
      })
    )
  })

  it('should not save when a request follows no change', async () => {
    const { result } = renderSaveHook()

    act(() => result.current.requestSaveSimulationProgress())
    await flushSaveQueue()

    expect(mockSaveSimulation).not.toHaveBeenCalled()
  })

  it('should not save when only the object identities changed', async () => {
    const { result } = renderSaveHook()

    // What revisiting a skipped question does: the same content, rebuilt.
    mockUseCurrentSimulation.mockReturnValue(
      aSimulation({
        situation: { [A_QUESTION]: 10000 },
        extendedSituation: {
          [A_QUESTION]: { source: 'answered', nodeValue: 10000 },
        },
        foldedSteps: [A_QUESTION],
      } as unknown as Partial<Simulation>)
    )
    act(() => result.current.requestSaveSimulationProgress())
    await flushSaveQueue()

    expect(mockSaveSimulation).not.toHaveBeenCalled()
  })

  it('should not save a completed simulation, which endTest owns', async () => {
    const { result } = renderSaveHook()

    mockUseCurrentSimulation.mockReturnValue(
      aSimulation({ foldedSteps: [A_QUESTION, ANOTHER_QUESTION] })
    )
    mockUseFormState.mockReturnValue({ progression: 1 })
    act(() => result.current.requestSaveSimulationProgress())
    await flushSaveQueue()

    expect(mockSaveSimulation).not.toHaveBeenCalled()
  })

  it('should send the progression computed by the form, not the stored one', async () => {
    const { result } = renderSaveHook()

    mockUseCurrentSimulation.mockReturnValue(
      aSimulation({
        foldedSteps: [A_QUESTION, ANOTHER_QUESTION],
        progression: 0.5,
      })
    )
    mockUseFormState.mockReturnValue({ progression: 0.75 })
    act(() => result.current.requestSaveSimulationProgress())
    await flushSaveQueue()

    expect(mockSaveSimulation).toHaveBeenCalledWith(
      expect.objectContaining({
        simulation: expect.objectContaining({ progression: 0.75 }),
      })
    )
  })

  it('should serialize saves rather than let them race', async () => {
    let resolveFirstSave: (value: unknown) => void = () => {}
    mockSaveSimulation.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveFirstSave = resolve
        })
    )

    const { result } = renderSaveHook()

    mockUseCurrentSimulation.mockReturnValue(
      aSimulation({ foldedSteps: [A_QUESTION, ANOTHER_QUESTION] })
    )
    act(() => result.current.requestSaveSimulationProgress())
    await flushSaveQueue()

    mockUseCurrentSimulation.mockReturnValue(
      aSimulation({
        foldedSteps: [A_QUESTION, ANOTHER_QUESTION, 'divers' as DottedName],
      })
    )
    act(() => result.current.requestSaveSimulationProgress())
    await flushSaveQueue()

    expect(mockSaveSimulation).toHaveBeenCalledTimes(1)

    resolveFirstSave(undefined)
    await flushSaveQueue()

    expect(mockSaveSimulation).toHaveBeenCalledTimes(2)
  })

  it('should report a failed save to Sentry', async () => {
    const error = new Error('simulation_completed')
    mockSaveSimulation.mockRejectedValue(error)

    const { result } = renderSaveHook()

    mockUseCurrentSimulation.mockReturnValue(
      aSimulation({ foldedSteps: [A_QUESTION, ANOTHER_QUESTION] })
    )
    act(() => result.current.requestSaveSimulationProgress())
    await flushSaveQueue()

    expect(mockSetExtra).toHaveBeenCalledWith('simulationId', 'simulation-id')
    expect(mockCaptureException).toHaveBeenCalledWith(error)
  })
})
