import crypto from 'crypto'
import { StatusCodes } from 'http-status-codes'
import supertest from 'supertest'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { redis } from '../../adapters/redis/client.js'
import { KEYS } from '../../adapters/redis/constant.js'
import app from '../../app.js'
import logger from '../../logger.js'
import { rateLimitSameRequestMiddleware } from '../rateLimitSameRequestMiddleware.js'

describe('rate limit same requests middleware', () => {
  app.use(rateLimitSameRequestMiddleware())
  app.use((_, res) => res.status(StatusCodes.NO_CONTENT).end())
  const agent = supertest(app)

  afterEach(
    () =>
      new Promise<void>((res, rej) => {
        redis.keys(`${KEYS.rateLimitSameRequests}_*`, async (err, keys) =>
          err
            ? rej(err)
            : redis.del(keys || [], (err) => (err ? rej(err) : res()))
        )
      })
  )

  describe('When doing request once', () => {
    test('Then it does not block the request', async () => {
      await agent.get('/').expect(StatusCodes.NO_CONTENT)
    })
  })

  describe('When doing same request twice', () => {
    test('Then it does block one of the request', async () => {
      const responses = await Promise.all([agent.get('/'), agent.get('/')])

      expect(responses.map(({ status }) => status).sort()).toEqual([
        StatusCodes.NO_CONTENT,
        StatusCodes.TOO_MANY_REQUESTS,
      ])
    })
  })

  describe('When doing same request twice with same parameters', () => {
    test('Then it does block one of the request', async () => {
      const responses = await Promise.all([
        agent.post('/').send({ foo: 'bar' }),
        agent.post('/').send({ foo: 'bar' }),
      ])

      expect(responses.map(({ status }) => status).sort()).toEqual([
        StatusCodes.NO_CONTENT,
        StatusCodes.TOO_MANY_REQUESTS,
      ])
    })
  })

  describe('When requests have same URL but different methods', () => {
    test('Then it does not block the requests', async () => {
      const responses = await Promise.all([agent.get('/'), agent.post('/')])

      expect(responses.map(({ status }) => status).sort()).toEqual([
        StatusCodes.NO_CONTENT,
        StatusCodes.NO_CONTENT,
      ])
    })
  })

  describe('When requests have same method but different urls', () => {
    test('Then it does not block the requests', async () => {
      const responses = await Promise.all([agent.get('/'), agent.get('/.env')])

      expect(responses.map(({ status }) => status).sort()).toEqual([
        StatusCodes.NO_CONTENT,
        StatusCodes.NO_CONTENT,
      ])
    })
  })

  describe('When requests have same method and url but different parameters', () => {
    test('Then it does not block the requests', async () => {
      const responses = await Promise.all([
        agent.post('/').send({ foo: 'bar' }),
        agent.post('/').send({ baz: 'qux' }),
      ])

      expect(responses.map(({ status }) => status).sort()).toEqual([
        StatusCodes.NO_CONTENT,
        StatusCodes.NO_CONTENT,
      ])
    })
  })

  describe('When failure occurs', () => {
    const unexpectedError = new Error('Something went wrong')

    beforeEach(() => {
      vi.spyOn(crypto, 'createHash').mockImplementation(() => {
        throw unexpectedError
      })
    })

    afterEach(() => {
      vi.spyOn(crypto, 'createHash').mockRestore()
    })

    test('Then it does not block the requests', async () => {
      const responses = await Promise.all([agent.get('/'), agent.get('/')])

      expect(responses.map(({ status }) => ({ status }))).toEqual(
        expect.arrayContaining([
          { status: StatusCodes.NO_CONTENT },
          { status: StatusCodes.NO_CONTENT },
        ])
      )
    })

    test('Then it logs the exception', async () => {
      await Promise.all([agent.get('/'), agent.get('/')])

      expect(logger.warn).toHaveBeenCalledWith(
        'Could not rate limit same requests',
        unexpectedError
      )
    })
  })
})
