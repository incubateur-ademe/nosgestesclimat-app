import axios from 'axios'
import type { Redis } from 'ioredis'
import * as v from 'valibot'
import { KEYS } from '../../src/adapters/redis/constant.ts'
import type { ValueOf } from '../../src/types/types.ts'

const REGIONS = {
  Antarctic: 'Antarctic',
  Americas: 'Americas',
  Europe: 'Europe',
  Africa: 'Africa',
  Asia: 'Asia',
  Oceania: 'Oceania',
} as const

type REGIONS = ValueOf<typeof REGIONS>

const RestCountriesValidator = v.array(
  v.object({
    name: v.object({
      common: v.string(),
    }),
    cca2: v.pipe(v.string(), v.regex(/^[A-Z]{2}$/)),
    region: v.enum(REGIONS),
  })
)

export const exec = async ({ redis }: { redis: Redis }) => {
  try {
    const restCountriesUrl = process.env.REST_COUNTRIES_URL

    if (!restCountriesUrl) {
      throw new Error('REST_COUNTRIES_URL is required')
    }

    const { data } = await axios.get(restCountriesUrl, {
      params: {
        fields: ['name', 'cca2', 'region'].join(','),
      },
    })

    const countries = v.parse(RestCountriesValidator, data)

    await redis.set(
      KEYS.geolocationCountries,
      JSON.stringify(
        countries.reduce(
          (
            acc: Record<
              string,
              { code: string; name: string; region: REGIONS }
            >,
            country
          ) => {
            acc[country.cca2] = {
              code: country.cca2,
              name: country.name.common,
              region: country.region,
            }
            return acc
          },
          {}
        )
      )
    )
    await redis.persist(KEYS.geolocationCountries)
    console.log(`Stored ${countries.length} countries to redis`)
  } catch (err) {
    console.error('Geolocation error', err)
    throw err
  }
}
