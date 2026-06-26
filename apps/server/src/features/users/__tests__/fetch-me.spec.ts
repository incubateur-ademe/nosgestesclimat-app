import { prisma } from '@nosgestesclimat/core/prisma/client'
import { StatusCodes } from 'http-status-codes'
import supertest from 'supertest'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import app from '../../../app.ts'
import { authHeaders } from '../../../core/__tests__/fixtures/authentication.fixture.ts'
import { login } from '../../authentication/__tests__/fixtures/login.fixture.ts'
import { ME_ROUTE } from './fixtures/users.fixture.ts'

describe('Given a NGC User', () => {
  const agent = supertest(app)
  const url = ME_ROUTE

  afterEach(async () => {
    await Promise.all([
      prisma.verificationCode.deleteMany(),
      prisma.user.deleteMany(),
      prisma.verifiedUser.deleteMany(),
    ])
  })

  describe('When requesting his user data', () => {
    describe('And logged out', () => {
      it(`Then it should return a ${StatusCodes.UNAUTHORIZED} error`, async () => {
        await agent.get(url).expect(StatusCodes.UNAUTHORIZED)
      })
    })
  })

  describe('And logged in', () => {
    let userId: string
    let email: string

    beforeEach(async () => {
      ;({ userId, email } = await login({ agent }))
    })

    it(`Then it should return ${StatusCodes.OK} with the user data`, async () => {
      const response = await agent
        .get(url)
        .set(authHeaders({ userId, email }))
        .expect(StatusCodes.OK)

      expect(response.body).toEqual({
        id: userId,
        email,
      })
    })
  })
})
