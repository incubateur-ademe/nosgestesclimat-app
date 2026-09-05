import { GROUP_URL, SIMULATION_URL } from '@/constants/urls/main'
import { parseModelString } from '@/helpers/server/model/models'
import type { Simulation } from '@/helpers/server/model/simulations'
import { buildNewSimulationPayload } from '@/services/simulations/build-new-simulation-payload'
import { http, HttpResponse } from 'msw'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mswServer } from '../../../__tests__/server'
import { createGroup } from '../../groups/create-group'
import { updateGroupParticipant } from '../../groups/update-group-participant'
import { uploadLocalSimulations } from '../upload-local-simulations'

/**
 * Regression tests for simulations persisted with the `FR-fr-0.0.0` database
 * default. Every write path must send a resolvable model, whatever the client
 * handed it.
 */

const DATABASE_DEFAULT_MODEL = 'FR-fr-0.0.0'

const getCurrentSimulationMock = vi.hoisted(() => vi.fn())

vi.mock('next/headers', () => ({
  headers: () =>
    Promise.resolve(
      new Map([
        ['x-region', JSON.stringify({ current: 'FR', initial: 'FR' })],
        ['x-next-i18n-router-locale', 'fr'],
      ])
    ),
  cookies: () => Promise.resolve(new Map()),
}))

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))

vi.mock('@/services/auth/get-user-session', () => ({
  getUserSession: () =>
    Promise.resolve({
      id: 'user-id',
      isAuth: true,
      email: 'alice@example.com',
    }),
}))

vi.mock('@/services/auth/create-app-session', () => ({
  createAppSession: vi.fn(),
}))

vi.mock('@/services/simulations/get-current-simulation', () => ({
  getCurrentSimulation: getCurrentSimulationMock,
}))

/** A simulation as it comes out of long-lived client state: no model at all. */
const modellessSimulation = (): Simulation => {
  const simulation = buildNewSimulationPayload({
    model: 'FR-fr-1.2.3',
    progression: 1,
  })
  simulation.computedResults.carbone.bilan = 1000
  return { ...simulation, model: undefined } as unknown as Simulation
}

/** Captures the simulation body POSTed to a given endpoint. */
const captureSimulationBody = (
  method: 'post',
  url: string,
  extract: (body: never) => unknown = (body) => body
) => {
  const captured: { value?: Simulation } = {}
  mswServer.use(
    http[method](url, async ({ request }) => {
      captured.value = extract((await request.json()) as never) as Simulation
      return HttpResponse.json({ id: 'created' })
    })
  )
  return captured
}

describe('simulation write paths', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('given a simulation without a model', () => {
    it('should resolve a model before adding a group participant', async () => {
      const captured = captureSimulationBody(
        'post',
        `${GROUP_URL}/:groupId/participants`,
        (body: { simulation: Simulation }) => body.simulation
      )

      await updateGroupParticipant({
        groupId: 'group-id',
        simulation: modellessSimulation(),
        name: 'Alice',
      })

      expect(parseModelString(captured.value?.model ?? '')).not.toBeNull()
      expect(captured.value?.model).not.toBe(DATABASE_DEFAULT_MODEL)
    })

    it('should resolve a model before creating a group with a participant', async () => {
      const captured = captureSimulationBody(
        'post',
        GROUP_URL,
        (body: { participants: { simulation: Simulation }[] }) =>
          body.participants[0].simulation
      )

      await createGroup({
        name: 'Group',
        emoji: '🌍',
        administratorName: 'Alice',
        participants: [{ simulation: modellessSimulation() }],
      })

      expect(parseModelString(captured.value?.model ?? '')).not.toBeNull()
      expect(captured.value?.model).not.toBe(DATABASE_DEFAULT_MODEL)
    })
  })

  describe('given no simulation at all', () => {
    it('should build one server-side when a participant joins before taking the test', async () => {
      getCurrentSimulationMock.mockResolvedValue(undefined)
      const captured = captureSimulationBody(
        'post',
        `${GROUP_URL}/:groupId/participants`,
        (body: { simulation: Simulation }) => body.simulation
      )

      await updateGroupParticipant({ groupId: 'group-id', name: 'Alice' })

      expect(parseModelString(captured.value?.model ?? '')).not.toBeNull()
      expect(captured.value?.model).not.toBe(DATABASE_DEFAULT_MODEL)
      expect(captured.value?.progression).toBe(0)
    })
  })

  describe('given a simulation still in progress', () => {
    it('should join the group with it rather than stranding it behind a new one', async () => {
      const inProgress = buildNewSimulationPayload({
        model: 'FR-fr-1.2.3',
        progression: 0.4,
      })
      getCurrentSimulationMock.mockResolvedValue(inProgress)
      const captured = captureSimulationBody(
        'post',
        `${GROUP_URL}/:groupId/participants`,
        (body: { simulation: Simulation }) => body.simulation
      )

      await updateGroupParticipant({ groupId: 'group-id', name: 'Alice' })

      expect(captured.value?.id).toBe(inProgress.id)
      expect(captured.value?.progression).toBe(0.4)
    })
  })

  describe('given legacy simulations uploaded from localStorage', () => {
    it('should leave them without a model, on purpose', async () => {
      const captured = captureSimulationBody('post', SIMULATION_URL)

      await uploadLocalSimulations([modellessSimulation()])

      expect(captured.value?.model).toBeUndefined()
    })
  })
})
