import axios from 'axios'
import type { Redis } from 'ioredis'
import { isIPv4 } from 'node:net'
import { createGunzip } from 'node:zlib'
import Papa from 'papaparse'
import { z } from 'zod'
import { KEYS } from '../../src/adapters/redis/constant.js'
import { convertIpToNumber } from '../../src/features/modele/geolocation.repository.js'

const GeoIpCsvValidator = z.object({
  ipStart: z.string(),
  countryCode: z.string().regex(/^[A-Z]{2}$/),
})

export const exec = async ({ redis }: { redis: Redis }) => {
  try {
    const geoipUrl = process.env.GEOIP_URL

    if (!geoipUrl) {
      throw new Error('GEOIP_URL is required')
    }

    const today = new Date()

    const datasourceStream = (
      await axios.get(
        geoipUrl.replace(
          '{{YYYY-MM}}',
          `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}`
        ),
        {
          responseType: 'stream',
        }
      )
    ).data.pipe(createGunzip())

    const parseStream = Papa.parse(Papa.NODE_STREAM_INPUT, {
      header: false,
    })

    datasourceStream.pipe(parseStream)

    const sortedArray = []

    for await (const chunk of parseStream) {
      const [ipStart, _, countryCode] = chunk

      const parsed = GeoIpCsvValidator.safeParse({ ipStart, countryCode })

      if (!parsed.success) {
        console.warn('Invalid CSV row:', {
          chunk,
          ipStart,
          countryCode,
          error: parsed.error,
        })
        continue
      }

      // Ignore IPv6 addresses
      if (!isIPv4(parsed.data.ipStart)) {
        continue
      }

      const ipStartNumber = convertIpToNumber(parsed.data.ipStart)
      sortedArray.push({
        ipStartNum: ipStartNumber,
        countryCode: parsed.data.countryCode,
      })
    }

    await redis.set(KEYS.geolocationSortedIps, JSON.stringify(sortedArray))
    await redis.persist(KEYS.geolocationSortedIps)
    console.log(`Stored ${sortedArray.length} IPs to redis`)
  } catch (err) {
    console.error('Geolocation error', err)
    throw err
  }
}
