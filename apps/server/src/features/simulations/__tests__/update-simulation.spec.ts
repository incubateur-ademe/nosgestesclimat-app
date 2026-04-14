import { faker } from '@faker-js/faker'
import { StatusCodes } from 'http-status-codes'
import supertest from 'supertest'
import { afterEach, beforeEach, describe, expect, test } from 'vitest'
import { prisma } from '../../../adapters/prisma/client.js'
import app from '../../../app.js'
import type { SimulationCreateInputDto } from '../simulations.validator.js'
import {
  CREATE_SIMULATION_ROUTE,
  createSimulation,
  getRandomTestCase,
} from './fixtures/simulations.fixtures.js'

describe('Given a completed simulation (progression = 1)', () => {
  const agent = supertest(app)
  const url = CREATE_SIMULATION_ROUTE
  const { computedResults, situation, extendedSituation } = getRandomTestCase()

  let userId: string
  let simulationId: string

  afterEach(async () => {
    await Promise.all([
      prisma.user.deleteMany(),
      prisma.verificationCode.deleteMany(),
      prisma.verifiedUser.deleteMany(),
    ])
  })

  beforeEach(async () => {
    userId = faker.string.uuid()
    simulationId = faker.string.uuid()

    await createSimulation({
      agent,
      userId,
      simulation: {
        id: simulationId,
        situation,
        progression: 1,
        computedResults,
        extendedSituation,
      },
    })
  })

  describe('When updating it with a different progression', () => {
    test(`Then it returns a ${StatusCodes.BAD_REQUEST} error`, async () => {
      const payload: SimulationCreateInputDto = {
        id: simulationId,
        situation,
        progression: 0.5,
        computedResults,
        extendedSituation,
      }

      const response = await agent
        .post(url.replace(':userId', userId))
        .send(payload)
        .expect(StatusCodes.BAD_REQUEST)

      expect(response.text).toContain('immutable')
    })
  })

  describe('When updating it with the same progression', () => {
    test(`Then it returns a ${StatusCodes.CREATED} response`, async () => {
      const payload: SimulationCreateInputDto = {
        id: simulationId,
        situation,
        progression: 1,
        computedResults,
        extendedSituation,
      }

      await agent
        .post(url.replace(':userId', userId))
        .send(payload)
        .expect(StatusCodes.CREATED)
    })
  })
})
