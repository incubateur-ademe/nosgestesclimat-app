import type { Simulation } from '@/helpers/server/model/simulations'
import { renderHook } from '@testing-library/react'
import type { PropsWithChildren } from 'react'
import { describe, expect, it, vi } from 'vitest'
import useCurrentSimulation, {
  useOptionalSimulation,
} from '../../../hooks/useCurrentSimulation/useCurrentSimulation'
import useUser from '../../../hooks/useUser/useUser'
import UserProvider from '../provider'

vi.mock('@/services/geolocation/get-geolocation', () => ({
  getGeolocation: () => Promise.resolve({ code: 'FR', name: 'France' }),
}))

const serverSimulation = {
  id: 'simulation-id',
  date: new Date(),
  situation: {},
  foldedSteps: [],
  computedResults: { carbone: {}, eau: {} },
  progression: 0,
  model: 'FR-fr-9.9.9',
} as unknown as Simulation

const wrapperWithoutSimulation = ({ children }: PropsWithChildren) => (
  <UserProvider userSession={null}>{children}</UserProvider>
)

const wrapperWithSimulation = ({ children }: PropsWithChildren) => (
  <UserProvider userSession={null} simulation={serverSimulation}>
    {children}
  </UserProvider>
)

describe('UserProvider', () => {
  describe('given no server simulation', () => {
    it('should expose no simulation rather than fabricating one', () => {
      const { result } = renderHook(() => useUser(), {
        wrapper: wrapperWithoutSimulation,
      })

      expect(result.current.simulation).toBeUndefined()
    })

    it('should return undefined from useOptionalSimulation', () => {
      const { result } = renderHook(() => useOptionalSimulation(), {
        wrapper: wrapperWithoutSimulation,
      })

      expect(result.current).toBeUndefined()
    })

    it('should make useCurrentSimulation throw', () => {
      expect(() =>
        renderHook(() => useCurrentSimulation(), {
          wrapper: wrapperWithoutSimulation,
        })
      ).toThrow(/requires a persisted simulation/)
    })
  })

  describe('given a server simulation', () => {
    it('should expose it, model included', () => {
      const { result } = renderHook(() => useCurrentSimulation(), {
        wrapper: wrapperWithSimulation,
      })

      expect(result.current.id).toBe('simulation-id')
      expect(result.current.model).toBe('FR-fr-9.9.9')
    })
  })
})
