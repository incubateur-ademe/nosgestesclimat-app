import { faker } from '@faker-js/faker'
import { StatusCodes } from 'http-status-codes'
import supertest from 'supertest'
import { beforeEach, describe, expect, test } from 'vitest'
import { redis } from '../../../adapters/redis/client.js'
import { KEYS } from '../../../adapters/redis/constant.js'
import app from '../../../app.js'
import {
  convertIpToNumber,
  initGeolocationStore,
} from '../geolocation.repository.js'

const agent = supertest(app)
const url = '/modele/v1/geolocation'

describe('Given no redis store', () => {
  beforeEach(async () => {
    await initGeolocationStore()
  })

  describe('When a user wants its country according to his/her ip', () => {
    test(`Then it returns a ${StatusCodes.NOT_FOUND} error`, async () => {
      const { text } = await agent
        .get(url)
        .set('x-client-ip', faker.internet.ipv4())
        .expect(StatusCodes.NOT_FOUND)

      expect(text).toEqual('could not determine ip country')
    })
  })

  describe('And ip v6 address', () => {
    describe('When a user wants its country according to his/her ip', () => {
      test(`Then it returns a ${StatusCodes.NOT_FOUND} error`, async () => {
        const { text } = await agent
          .get(url)
          .set('x-client-ip', faker.internet.ipv6())
          .expect(StatusCodes.NOT_FOUND)

        expect(text).toEqual('ip v4 required')
      })
    })
  })
})

describe('Given redis store', () => {
  const frIP = faker.internet.ipv4()
  const sortedIps = [
    {
      ipStartNum: 0,
      countryCode: 'BE',
    },
    {
      ipStartNum: convertIpToNumber(frIP),
      countryCode: 'FR',
    },
  ]
  const countries = {
    FR: {
      code: 'FR',
      name: 'France',
      region: 'Europe',
    },
    BE: {
      code: 'BE',
      name: 'Belgique',
      region: 'Europe',
    },
  }

  beforeEach(async () => {
    await Promise.all([
      new Promise<void>((resolve) =>
        redis.set(KEYS.geolocationSortedIps, JSON.stringify(sortedIps), () =>
          resolve()
        )
      ),
      new Promise<void>((resolve) =>
        redis.set(KEYS.geolocationCountries, JSON.stringify(countries), () =>
          resolve()
        )
      ),
    ])

    initGeolocationStore()
  })

  describe('When a user wants its country according to his/her ip', () => {
    test(`Then it returns a ${StatusCodes.OK} response with the country code`, async () => {
      const clientIp = faker.internet.ipv4()

      const { body } = await agent
        .get(url)
        .set('x-client-ip', clientIp)
        .expect(StatusCodes.OK)

      expect(body).toEqual(
        countries[
          convertIpToNumber(frIP) > convertIpToNumber(clientIp) ? 'BE' : 'FR'
        ]
      )
    })
  })

  describe('And could not determine ip country', () => {
    beforeEach(
      () =>
        new Promise<void>((resolve) =>
          redis.set(
            KEYS.geolocationSortedIps,
            JSON.stringify([
              {
                ipStartNum: 0,
                countryCode: 'ZZ',
              },
            ]),
            () => {
              initGeolocationStore()
              resolve()
            }
          )
        )
    )

    test(`Then it returns a ${StatusCodes.NOT_FOUND} error`, async () => {
      const { text } = await agent
        .get(url)
        .set('x-client-ip', faker.internet.ipv4())
        .expect(StatusCodes.NOT_FOUND)

      expect(text).toEqual('could not determine ip country')
    })
  })

  describe('And ip v6 address', () => {
    describe('When a user wants its country according to his/her ip', () => {
      test(`Then it returns a ${StatusCodes.NOT_FOUND} error`, async () => {
        const { text } = await agent
          .get(url)
          .set('x-client-ip', faker.internet.ipv6())
          .expect(StatusCodes.NOT_FOUND)

        expect(text).toEqual('ip v4 required')
      })
    })
  })

  describe('And localhost', () => {
    describe('When a user wants its country according to his/her ip', () => {
      test(`Then it returns a ${StatusCodes.NOT_FOUND} error`, async () => {
        const { text } = await agent.get(url).expect(StatusCodes.NOT_FOUND)

        expect(text).toEqual('ip v4 required')
      })
    })
  })
})
