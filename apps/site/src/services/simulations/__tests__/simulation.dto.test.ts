import { simulationFactory } from '@nosgestesclimat/core/features/simulations/factories/simulation.factory'
import type { Simulation as SimulationEntity } from '@nosgestesclimat/core/features/simulations/types/simulation'
import { describe, expect, it } from 'vitest'

import { toSimulationDto } from '../simulation.dto'

const buildEntity = (
  overrides: Partial<SimulationEntity> = {}
): SimulationEntity =>
  simulationFactory
    .withModelRegion('FR')
    .withModelLocale('fr')
    .withModelVersion({ publishedTag: '1.2.3' })
    .params({
      date: new Date('2024-01-01T00:00:00.000Z'),
      createdAt: new Date('2024-01-01T00:00:00.000Z'),
      updatedAt: new Date('2024-01-02T00:00:00.000Z'),
      ...overrides,
    })
    .build()

describe('toSimulationDto', () => {
  it('serializes the model to a string', () => {
    const dto = toSimulationDto(buildEntity())

    expect(dto.model).toBe('FR-fr-1.2.3')
  })

  it('converts date and updatedAt to ISO strings', () => {
    const dto = toSimulationDto(buildEntity())

    expect(dto.date).toBe('2024-01-01T00:00:00.000Z')
    expect(dto.updatedAt).toBe('2024-01-02T00:00:00.000Z')
  })

  it('passes through situation, foldedSteps, actionChoices, and computedResults', () => {
    const entity = buildEntity()
    const dto = toSimulationDto(entity)

    expect(dto.situation).toBe(entity.situation)
    expect(dto.foldedSteps).toBe(entity.foldedSteps)
    expect(dto.actionChoices).toBe(entity.actionChoices)
    expect(dto.computedResults).toEqual(entity.computedResults)
  })

  it('passes through polls and groups when present', () => {
    const polls = [{ id: 'poll-1', slug: 'test-poll', name: 'Test Poll' }]
    const groups = [{ id: 'group-1' }]
    const dto = toSimulationDto(buildEntity({ polls, groups }))

    expect(dto.polls).toEqual(polls)
    expect(dto.groups).toEqual(groups)
  })

  it('omits polls and groups when absent', () => {
    const dto = toSimulationDto(buildEntity())

    expect(dto.polls).toBeUndefined()
    expect(dto.groups).toBeUndefined()
  })

  it('does not set user or persona', () => {
    const dto = toSimulationDto(buildEntity())

    expect(dto.user).toBeUndefined()
    expect(dto.persona).toBeUndefined()
  })
})
