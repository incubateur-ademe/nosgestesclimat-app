import { faker } from '@faker-js/faker'
import { continents, countries } from 'countries-list'
import { StatusCodes } from 'http-status-codes'
import supertest from 'supertest'
import { beforeEach, describe, expect, test } from 'vitest'
import { redis } from '../../../adapters/redis/client.ts'
import { KEYS } from '../../../adapters/redis/constant.ts'
import app from '../../../app.ts'
import {
  convertIpToNumber,
  initGeolocationStore,
} from '../geolocation.repository.ts'

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

  beforeEach(async () => {
    await redis.set(KEYS.geolocationSortedIps, JSON.stringify(sortedIps))

    initGeolocationStore()
  })

  describe('When a user wants its country according to his/her ip', () => {
    test(`Then it returns a ${StatusCodes.OK} response with the country code`, async () => {
      const clientIp = faker.internet.ipv4()

      const { body } = await agent
        .get(url)
        .set('x-client-ip', clientIp)
        .expect(StatusCodes.OK)

      const expectedCountryCode =
        convertIpToNumber(frIP) > convertIpToNumber(clientIp) ? 'BE' : 'FR'
      const countryData =
        countries[expectedCountryCode as keyof typeof countries]
      expect(body).toEqual({
        code: expectedCountryCode,
        region: continents[countryData.continent],
      })
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
