import express from 'express'
import { StatusCodes } from 'http-status-codes'
import jwt from 'jsonwebtoken'

import { faker } from '@faker-js/faker'
import supertest from 'supertest'
import { describe, expect, test } from 'vitest'
import { config } from '../../config.ts'
import { COOKIE_MAX_AGE } from '../../features/authentication/authentication.service.ts'
import { authentificationMiddleware } from '../authentificationMiddleware.ts'

describe('authentication middleware', () => {
  const app = express()
  app.use(express.json())
  app.use(authentificationMiddleware())
  app.use((_, res) => res.status(StatusCodes.NO_CONTENT).end())
  const agent = supertest(app)

  describe('With no cookie', () => {
    test(`Should return a ${StatusCodes.UNAUTHORIZED} error`, async () => {
      await agent.get('/').expect(StatusCodes.UNAUTHORIZED)
    })
  })

  describe('With incorrect cookie', () => {
    test(`Should return a ${StatusCodes.UNAUTHORIZED} error`, async () => {
      await agent
        .get('/')
        .set('cookie', 'NEXT_LOCALE=fr')
        .expect(StatusCodes.UNAUTHORIZED)
    })
  })

  describe('With invalid cookie', () => {
    test(`Should return a ${StatusCodes.UNAUTHORIZED} error`, async () => {
      await agent
        .get('/')
        .set('cookie', 'ngc_server_auth_jwt=invalid cookie')
        .expect(StatusCodes.UNAUTHORIZED)
    })
  })

  describe('With incorrect and invalid cookie', () => {
    test(`Should return a ${StatusCodes.UNAUTHORIZED} error`, async () => {
      const cookies = faker.helpers.arrayElements(
        ['ngc_server_auth_jwt=invalid cookie', 'NEXT_LOCALE=fr'],
        2
      )

      await agent
        .get('/')
        .set('cookie', cookies.join(' ; '))
        .expect(StatusCodes.UNAUTHORIZED)
    })
  })

  describe('With valid cookie', () => {
    let token: string
    let userId: string
    let email: string

    test(`Should return a ${StatusCodes.NO_CONTENT} and a cookie`, async () => {
      userId = faker.string.uuid()
      email = faker.internet.email()
      token = jwt.sign({ email, userId }, config.security.jwt.secret, {
        expiresIn: COOKIE_MAX_AGE,
      })

      const response = await agent
        .get('/')
        .set('cookie', `ngc_server_auth_jwt=${token}`)
        .expect(StatusCodes.NO_CONTENT)

      const [cookie] = response.headers['set-cookie']
      const userToken = cookie
        .split(';')
        .shift()
        ?.replace('ngc_server_auth_jwt=', '')

      expect(jwt.decode(userToken!)).toEqual({
        userId,
        email,
        exp: expect.any(Number),
        iat: expect.any(Number),
      })
    })
  })

  describe('With incorrect and valid cookie', () => {
    test(`Should return a ${StatusCodes.NO_CONTENT} and a cookie`, async () => {
      const userId = faker.string.uuid()
      const email = faker.internet.email()
      const token = jwt.sign({ email, userId }, config.security.jwt.secret, {
        expiresIn: COOKIE_MAX_AGE,
      })

      const cookies = faker.helpers.arrayElements(
        [`ngc_server_auth_jwt=${token}`, 'NEXT_LOCALE=fr'],
        2
      )

      const response = await agent
        .get('/')
        .set('cookie', cookies.join(' ; '))
        .expect(StatusCodes.NO_CONTENT)

      const [cookie] = response.headers['set-cookie']
      const userToken = cookie
        .split(';')
        .shift()
        ?.replace('ngc_server_auth_jwt=', '')

      expect(jwt.decode(userToken!)).toEqual({
        userId,
        email,
        exp: expect.any(Number),
        iat: expect.any(Number),
      })
    })
  })

  describe('With a valid internal key', () => {
    const userApp = express()
    userApp.use(express.json())
    userApp.use(authentificationMiddleware())
    userApp.use((req, res) => res.status(StatusCodes.OK).json(req.user))
    const userAgent = supertest(userApp)

    describe('And both user headers', () => {
      test(`Should set req.user from the headers without issuing a cookie`, async () => {
        const userId = faker.string.uuid()
        const email = faker.internet.email()

        const response = await userAgent
          .get('/')
          .set('x-internal-key', config.security.internalApiKey)
          .set('x-user-id', userId)
          .set('x-user-email', email)
          .expect(StatusCodes.OK)

        expect(response.body).toEqual({ userId, email })
        expect(response.headers['set-cookie']).toBeUndefined()
      })

      test('Should take precedence over an invalid cookie', async () => {
        await agent
          .get('/')
          .set('x-internal-key', config.security.internalApiKey)
          .set('x-user-id', faker.string.uuid())
          .set('x-user-email', faker.internet.email())
          .set('cookie', 'ngc_server_auth_jwt=invalid cookie')
          .expect(StatusCodes.NO_CONTENT)
      })
    })

    describe('But a missing user header', () => {
      test(`Should return a ${StatusCodes.UNAUTHORIZED} error`, async () => {
        await agent
          .get('/')
          .set('x-internal-key', config.security.internalApiKey)
          .set('x-user-id', faker.string.uuid())
          .expect(StatusCodes.UNAUTHORIZED)
      })
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
})

describe('authentication middleware passIfUnauthorized: true', () => {
  const app = express()
  app.use(express.json())
  app.use(authentificationMiddleware({ passIfUnauthorized: true }))
  app.use((_, res) => res.status(StatusCodes.NO_CONTENT).end())
  const agent = supertest(app)

  describe('With no cookie', () => {
    test(`Should return a ${StatusCodes.NO_CONTENT} response with no cookie`, async () => {
      const response = await agent.get('/').expect(StatusCodes.NO_CONTENT)

      expect(response.headers['set-cookie']).toBeUndefined()
    })
  })

  describe('With incorrect cookie', () => {
    test(`Should return a ${StatusCodes.NO_CONTENT} response with no cookie`, async () => {
      const response = await agent
        .get('/')
        .set('cookie', 'NEXT_LOCALE=fr')
        .expect(StatusCodes.NO_CONTENT)

      expect(response.headers['set-cookie']).toBeUndefined()
    })
  })

  describe('With invalid cookie', () => {
    test(`Should return a ${StatusCodes.NO_CONTENT} response with no cookie`, async () => {
      const response = await agent
        .get('/')
        .set('cookie', 'ngc_server_auth_jwt=invalid cookie')
        .expect(StatusCodes.NO_CONTENT)

      expect(response.headers['set-cookie']).toBeUndefined()
    })
  })

  describe('With incorrect and invalid cookie', () => {
    test(`Should return a ${StatusCodes.NO_CONTENT} response with no cookie`, async () => {
      const cookies = faker.helpers.arrayElements(
        ['ngc_server_auth_jwt=invalid cookie', 'NEXT_LOCALE=fr'],
        2
      )

      const response = await agent
        .get('/')
        .set('cookie', cookies.join(' ; '))
        .expect(StatusCodes.NO_CONTENT)

      expect(response.headers['set-cookie']).toBeUndefined()
    })
  })

  describe('With valid cookie', () => {
    let token: string
    let userId: string
    let email: string

    test(`Should return a ${StatusCodes.NO_CONTENT} and a cookie`, async () => {
      userId = faker.string.uuid()
      email = faker.internet.email()
      token = jwt.sign({ email, userId }, config.security.jwt.secret, {
        expiresIn: COOKIE_MAX_AGE,
      })

      const response = await agent
        .get('/')
        .set('cookie', `ngc_server_auth_jwt=${token}`)
        .expect(StatusCodes.NO_CONTENT)

      const [cookie] = response.headers['set-cookie']
      const userToken = cookie
        .split(';')
        .shift()
        ?.replace('ngc_server_auth_jwt=', '')

      expect(jwt.decode(userToken!)).toEqual({
        userId,
        email,
        exp: expect.any(Number),
        iat: expect.any(Number),
      })
    })
  })

  describe('With incorrect and valid cookie', () => {
    test(`Should return a ${StatusCodes.NO_CONTENT} and a cookie`, async () => {
      const userId = faker.string.uuid()
      const email = faker.internet.email()
      const token = jwt.sign({ email, userId }, config.security.jwt.secret, {
        expiresIn: COOKIE_MAX_AGE,
      })

      const cookies = faker.helpers.arrayElements(
        [`ngc_server_auth_jwt=${token}`, 'NEXT_LOCALE=fr'],
        2
      )

      const response = await agent
        .get('/')
        .set('cookie', cookies.join(' ; '))
        .expect(StatusCodes.NO_CONTENT)

      const [cookie] = response.headers['set-cookie']
      const userToken = cookie
        .split(';')
        .shift()
        ?.replace('ngc_server_auth_jwt=', '')

      expect(jwt.decode(userToken!)).toEqual({
        userId,
        email,
        exp: expect.any(Number),
        iat: expect.any(Number),
      })
    })
  })

  describe('With a valid internal key', () => {
    describe('And both user headers', () => {
      test(`Should return a ${StatusCodes.NO_CONTENT} and set req.user without a cookie`, async () => {
        const response = await agent
          .get('/')
          .set('x-internal-key', config.security.internalApiKey)
          .set('x-user-id', faker.string.uuid())
          .set('x-user-email', faker.internet.email())
          .expect(StatusCodes.NO_CONTENT)

        expect(response.headers['set-cookie']).toBeUndefined()
      })
    })

    describe('But a missing user header', () => {
      test(`Should return a ${StatusCodes.NO_CONTENT} response with no cookie`, async () => {
        const response = await agent
          .get('/')
          .set('x-internal-key', config.security.internalApiKey)
          .set('x-user-id', faker.string.uuid())
          .expect(StatusCodes.NO_CONTENT)

        expect(response.headers['set-cookie']).toBeUndefined()
      })
    })
  })
})
