import { generateSimulation } from '@/helpers/simulation/generateSimulation'
import type {
  DottedName,
  ExtendedSituation,
} from '@incubateur-ademe/nosgestesclimat'
import type { Migration } from '@publicodes/tools/migration'
import { act, renderHook } from '@testing-library/react'
import type { Situation } from 'publicodes'
import { vi } from 'vitest'
import type { Simulation } from '../../../../types'
import useSimulations from '../useSimulations'

// Mock only external dependencies
vi.mock('@/helpers/simulation/generateSimulation')
vi.mock('@/utils/browser/safeLocalStorage')

const mockGenerateSimulation = vi.mocked(generateSimulation)

describe('useSimulations', () => {
  const mockMigrationInstructions: Migration = {
    keysToMigrate: {},
    valuesToMigrate: {},
  } as unknown as Migration

  const createMockSimulation = (
    overrides: Partial<Simulation> = {}
  ): Simulation => ({
    id: 'test-id',
    date: new Date(),
    situation: {},
    extendedSituation: {} as ExtendedSituation,
    foldedSteps: [],
    actionChoices: {},
    computedResults: {
      carbone: { bilan: 0, categories: {} as Record<DottedName, number> },
      eau: { bilan: 0, categories: {} as Record<DottedName, number> },
    },
    progression: 0,
    ...overrides,
  })

  beforeEach(() => {
    vi.clearAllMocks()
    mockGenerateSimulation.mockImplementation((params = {}) => ({
      id: params.id || 'generated-id',
      date: params.date || new Date(),
      situation: params.situation || {},
      extendedSituation: params.extendedSituation || ({} as ExtendedSituation),
      foldedSteps: params.foldedSteps || [],
      actionChoices: params.actionChoices || {},
      persona: params.persona,
      computedResults: params.computedResults || {
        carbone: { bilan: 0, categories: {} as Record<DottedName, number> },
        eau: { bilan: 0, categories: {} as Record<DottedName, number> },
      },
      progression: params.progression || 0,
      polls: params.polls,
      groups: params.groups,
    }))
  })

  describe('initSimulation', () => {
    it('should create and add a new simulation', () => {
      const setSimulations = vi.fn()
      const setCurrentSimulationId = vi.fn()

      const { result } = renderHook(() =>
        useSimulations({
          simulations: [],
          setSimulations,
          currentSimulationId: '',
          setCurrentSimulationId,
          migrationInstructions: mockMigrationInstructions,
        })
      )

      act(() => {
        result.current.initSimulation({ id: 'test-simulation' })
      })

      expect(setSimulations).toHaveBeenCalledWith(expect.any(Function))
      expect(setCurrentSimulationId).toHaveBeenCalledWith(expect.any(String))
      expect(mockGenerateSimulation).toHaveBeenCalledWith({
        id: 'test-simulation',
        migrationInstructions: mockMigrationInstructions,
      })
    })

    it('should not add simulation if ID already exists', () => {
      const existingSimulation = createMockSimulation({ id: 'existing-id' })
      const setSimulations = vi.fn()

      const { result } = renderHook(() =>
        useSimulations({
          simulations: [existingSimulation],
          setSimulations,
          currentSimulationId: '',
          setCurrentSimulationId: vi.fn(),
          migrationInstructions: mockMigrationInstructions,
        })
      )

      act(() => {
        result.current.initSimulation({ id: 'existing-id' })
      })

      const updateFunction = setSimulations.mock.calls[0][0]
      const resultSimulations = updateFunction([existingSimulation])
      expect(resultSimulations).toEqual([existingSimulation])
    })
  })

  describe('deleteSimulation', () => {
    it('should remove simulation from list', () => {
      const simulation1 = createMockSimulation({ id: 'sim-1' })
      const simulation2 = createMockSimulation({ id: 'sim-2' })
      const simulation3 = createMockSimulation({ id: 'sim-3' })
      const setSimulations = vi.fn()

      const { result } = renderHook(() =>
        useSimulations({
          simulations: [simulation1, simulation2, simulation3],
          setSimulations,
          currentSimulationId: 'sim-2',
          setCurrentSimulationId: vi.fn(),
          migrationInstructions: mockMigrationInstructions,
        })
      )

      act(() => {
        result.current.deleteSimulation('sim-2')
      })

      const updateFunction = setSimulations.mock.calls[0][0]
      const resultSimulations = updateFunction([
        simulation1,
        simulation2,
        simulation3,
      ])
      expect(resultSimulations).toEqual([simulation1, simulation3])
    })
  })

  describe('updateCurrentSimulation', () => {
    it('should update situation and sync extendedSituation', () => {
      const currentSimulation = createMockSimulation({
        id: 'current-sim',
        situation: {
          'transport . voiture . km': 1000,
        } as unknown as Situation<DottedName>,
        extendedSituation: {
          'transport . voiture . km': { source: 'answered', nodeValue: 1000 },
        } as unknown as ExtendedSituation,
      })
      const setSimulations = vi.fn()

      const { result } = renderHook(() =>
        useSimulations({
          simulations: [currentSimulation],
          setSimulations,
          currentSimulationId: 'current-sim',
          setCurrentSimulationId: vi.fn(),
          migrationInstructions: mockMigrationInstructions,
        })
      )

      const newSituation = {
        'transport . voiture . km': 2000,
        'logement . surface': 50,
      } as unknown as Record<DottedName, number>

      act(() => {
        result.current.updateCurrentSimulation({ situation: newSituation })
      })

      const updateFunction = setSimulations.mock.calls[0][0]
      const resultSimulations = updateFunction([currentSimulation])
      const updatedSimulation = resultSimulations[0]

      expect(updatedSimulation.situation).toEqual(newSituation)
      expect(
        updatedSimulation.extendedSituation['transport . voiture . km']
      ).toEqual({
        source: 'answered',
        nodeValue: 2000,
      })
    })

    it('should handle foldedStepToAdd for regular questions (default)', () => {
      const currentSimulation = createMockSimulation({
        id: 'current-sim',
        foldedSteps: [],
        extendedSituation: {} as ExtendedSituation,
      })
      const setSimulations = vi.fn()

      const { result } = renderHook(() =>
        useSimulations({
          simulations: [currentSimulation],
          setSimulations,
          currentSimulationId: 'current-sim',
          setCurrentSimulationId: vi.fn(),
          migrationInstructions: mockMigrationInstructions,
        })
      )

      act(() => {
        result.current.updateCurrentSimulation({
          foldedStepToAdd: {
            foldedStep: 'divers . textile . volume' as DottedName,
            isMosaicParent: false,
            isMosaicChild: false,
          },
        })
      })

      const updateFunction = setSimulations.mock.calls[0][0]
      const resultSimulations = updateFunction([currentSimulation])
      const updatedSimulation = resultSimulations[0]

      expect(updatedSimulation.foldedSteps).toContain(
        'divers . textile . volume'
      )
      expect(
        updatedSimulation.extendedSituation['divers . textile . volume']
      ).toEqual({
        source: 'default',
        nodeValue: 'non défini',
      })
    })

    it('should handle default mosaic parent correctly', () => {
      const currentSimulation = createMockSimulation({
        id: 'current-sim',
        foldedSteps: [],
        extendedSituation: {} as ExtendedSituation,
      })
      const setSimulations = vi.fn()

      const { result } = renderHook(() =>
        useSimulations({
          simulations: [currentSimulation],
          setSimulations,
          currentSimulationId: 'current-sim',
          setCurrentSimulationId: vi.fn(),
          migrationInstructions: mockMigrationInstructions,
        })
      )

      act(() => {
        result.current.updateCurrentSimulation({
          foldedStepToAdd: {
            foldedStep: 'divers . ameublement . meubles' as DottedName,
            value: null,
            isMosaicParent: true,
          },
        })
      })

      const updateFunction = setSimulations.mock.calls[0][0]
      const resultSimulations = updateFunction([currentSimulation])
      const updatedSimulation = resultSimulations[0]

      expect(updatedSimulation.foldedSteps).toContain(
        'divers . ameublement . meubles'
      )
      expect(
        updatedSimulation.extendedSituation['divers . ameublement . meubles']
      ).toBeUndefined()
    })

    it('should handle default mosaic child correctly', () => {
      const currentSimulation = createMockSimulation({
        id: 'current-sim',
        foldedSteps: [],
        extendedSituation: {} as ExtendedSituation,
      })
      const setSimulations = vi.fn()

      const { result } = renderHook(() =>
        useSimulations({
          simulations: [currentSimulation],
          setSimulations,
          currentSimulationId: 'current-sim',
          setCurrentSimulationId: vi.fn(),
          migrationInstructions: mockMigrationInstructions,
        })
      )

      act(() => {
        result.current.updateCurrentSimulation({
          foldedStepToAdd: {
            foldedStep: 'divers . ameublement . meubles . canapé' as DottedName,
            value: 1,
            isMosaicChild: true,
          },
        })
      })

      const updateFunction = setSimulations.mock.calls[0][0]
      const resultSimulations = updateFunction([currentSimulation])
      const updatedSimulation = resultSimulations[0]

      expect(updatedSimulation.foldedSteps).not.toContain(
        'divers . ameublement . meubles . canapé'
      )
      expect(
        updatedSimulation.extendedSituation[
          'divers . ameublement . meubles . canapé'
        ]
      ).toEqual({
        source: 'default',
        nodeValue: 1,
      })
    })
  })

  describe('currentSimulation', () => {
    it('should return simulation by currentSimulationId', () => {
      const simulation1 = createMockSimulation({
        id: 'sim-1',
        progression: 0.2,
      })
      const simulation2 = createMockSimulation({
        id: 'sim-2',
        progression: 0.5,
      })

      const { result } = renderHook(() =>
        useSimulations({
          simulations: [simulation1, simulation2],
          setSimulations: vi.fn(),
          currentSimulationId: 'sim-2',
          setCurrentSimulationId: vi.fn(),
          migrationInstructions: mockMigrationInstructions,
        })
      )

      expect(result.current.currentSimulation).toEqual(simulation2)
    })

    it('should return first simulation when currentSimulationId not found', () => {
      const simulation1 = createMockSimulation({ id: 'sim-1' })
      const simulation2 = createMockSimulation({ id: 'sim-2' })

      const { result } = renderHook(() =>
        useSimulations({
          simulations: [simulation1, simulation2],
          setSimulations: vi.fn(),
          currentSimulationId: 'non-existent-id',
          setCurrentSimulationId: vi.fn(),
          migrationInstructions: mockMigrationInstructions,
        })
      )

      expect(result.current.currentSimulation).toEqual(simulation1)
    })

    it('should return undefined when no simulations exist', () => {
      const { result } = renderHook(() =>
        useSimulations({
          simulations: [],
          setSimulations: vi.fn(),
          currentSimulationId: 'any-id',
          setCurrentSimulationId: vi.fn(),
          migrationInstructions: mockMigrationInstructions,
        })
      )

      expect(result.current.currentSimulation).toBeUndefined()
    })
  })
})
