import express from 'express'
import { StatusCodes } from 'http-status-codes'
import jwt from 'jsonwebtoken'

import { faker } from '@faker-js/faker'
import supertest from 'supertest'
import { describe, expect, test } from 'vitest'
import { config } from '../../config.js'
import { COOKIE_MAX_AGE } from '../../features/authentication/authentication.service.js'
import { authentificationMiddleware } from '../authentificationMiddleware.js'

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
})
