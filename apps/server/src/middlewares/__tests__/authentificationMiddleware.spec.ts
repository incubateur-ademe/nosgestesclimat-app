import express from 'express'
import { StatusCodes } from 'http-status-codes'

import { faker } from '@faker-js/faker'
import supertest from 'supertest'
import { describe, expect, test } from 'vitest'
import { config } from '../../config.ts'
import { authentificationMiddleware } from '../authentificationMiddleware.ts'

describe('authentication middleware', () => {
  const app = express()
  app.use(express.json())
  app.use(authentificationMiddleware())
  app.use((req, res) => res.status(StatusCodes.OK).json(req.user))
  const agent = supertest(app)

  describe('With no internal key', () => {
    test(`Should return a ${StatusCodes.UNAUTHORIZED} error`, async () => {
      await agent
        .get('/')
        .set('x-user-id', faker.string.uuid())
        .set('x-user-email', faker.internet.email())
        .expect(StatusCodes.UNAUTHORIZED)
    })
  })

  describe('With an invalid internal key', () => {
    test(`Should return a ${StatusCodes.UNAUTHORIZED} error`, async () => {
      await agent
        .get('/')
        .set('x-internal-key', 'wrong-key')
        .set('x-user-id', faker.string.uuid())
        .set('x-user-email', faker.internet.email())
        .expect(StatusCodes.UNAUTHORIZED)
    })
  })

  describe('With a valid internal key', () => {
    describe('And both user headers (verified user)', () => {
      test(`Should set req.user from the headers without issuing a cookie`, async () => {
        const userId = faker.string.uuid()
        const email = faker.internet.email()

        const response = await agent
          .get('/')
          .set('x-internal-key', config.security.internalApiKey)
          .set('x-user-id', userId)
          .set('x-user-email', email)
          .expect(StatusCodes.OK)

        expect(response.body).toEqual({ id: userId, email })
        expect(response.headers['set-cookie']).toBeUndefined()
      })
    })

    describe('And only the user id header (anonymous user)', () => {
      test(`Should set req.user without an email`, async () => {
        const userId = faker.string.uuid()

        const response = await agent
          .get('/')
          .set('x-internal-key', config.security.internalApiKey)
          .set('x-user-id', userId)
          .expect(StatusCodes.OK)

        expect(response.body).toEqual({ id: userId })
        expect(response.headers['set-cookie']).toBeUndefined()
      })
    })

    describe('But a missing user id header', () => {
      test(`Should return a ${StatusCodes.UNAUTHORIZED} error`, async () => {
        await agent
          .get('/')
          .set('x-internal-key', config.security.internalApiKey)
          .set('x-user-email', faker.internet.email())
          .expect(StatusCodes.UNAUTHORIZED)
      })
    })
  })
})

describe('authentication middleware passIfUnauthorized: true', () => {
  const app = express()
  app.use(express.json())
  app.use(authentificationMiddleware({ passIfUnauthorized: true }))
  app.use((req, res) => res.status(StatusCodes.OK).json(req.user ?? {}))
  const agent = supertest(app)

  describe('With no internal key', () => {
    test(`Should pass through without a user`, async () => {
      const response = await agent.get('/').expect(StatusCodes.OK)

      expect(response.body).toEqual({})
      expect(response.headers['set-cookie']).toBeUndefined()
    })
  })

  describe('With a valid internal key but no user id header', () => {
    test(`Should pass through without a user`, async () => {
      const response = await agent
        .get('/')
        .set('x-internal-key', config.security.internalApiKey)
        .expect(StatusCodes.OK)

      expect(response.body).toEqual({})
      expect(response.headers['set-cookie']).toBeUndefined()
    })
  })

  describe('With a valid internal key and the user id header', () => {
    test(`Should set req.user`, async () => {
      const userId = faker.string.uuid()
      const email = faker.internet.email()

      const response = await agent
        .get('/')
        .set('x-internal-key', config.security.internalApiKey)
        .set('x-user-id', userId)
        .set('x-user-email', email)
        .expect(StatusCodes.OK)

      expect(response.body).toEqual({ id: userId, email })
      expect(response.headers['set-cookie']).toBeUndefined()
    })
  })
})
