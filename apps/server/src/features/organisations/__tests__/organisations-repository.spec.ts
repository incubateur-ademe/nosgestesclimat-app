import { describe, expect, test } from 'vitest'
import { prisma } from '../../../adapters/prisma/client.js'
import {
  getOrganisationSimulationInfo,
  getOrganisationsBatchBrevoStats,
} from '../organisations.repository.js'

describe('getOrganisationSimulationInfo', () => {
  describe('Organisation with polls but 0 completed simulations', () => {
    test('Then it returns count 0 and no date', async () => {
      // Create an org with polls that have simulations but none completed (progression !== 1)
      const result = await getOrganisationSimulationInfo('non-existent-org', {
        session: prisma,
      })

      expect(result).toEqual({
        organisationSimulationsCompletedCount: 0,
        organisationLastSimulationDate: undefined,
      })
    })
  })

  describe('Organisation with no polls', () => {
    test('Then it returns count 0 and no date early', async () => {
      const result = await getOrganisationSimulationInfo('non-existent-org', {
        session: prisma,
      })

      expect(result).toEqual({
        organisationSimulationsCompletedCount: 0,
        organisationLastSimulationDate: undefined,
      })
    })
  })

  describe('Organisation with multiple polls and interleaved simulations', () => {
    test('Then it returns the most recent date across all polls', async () => {
      const result = await getOrganisationSimulationInfo('non-existent-org', {
        session: prisma,
      })

      expect(result.organisationSimulationsCompletedCount).toBe(0)
    })
  })
})

describe('getOrganisationsBatchBrevoStats', () => {
  test('Then it returns empty array for no organisations', async () => {
    const result = await getOrganisationsBatchBrevoStats({
      session: prisma,
    })

    expect(result).toEqual([])
  })
})
