import { redis } from '../../adapters/redis/client.js'
import { KEYS } from '../../adapters/redis/constant.js'
import logger from '../../logger.js'

type RedisStoredIp = { ipStartNum: number; countryCode: string }

type RedisStoredCountry = { code: string; name: string; region: string }

let store:
  | {
      sortedIps?: RedisStoredIp[]
      countries?: Record<string, RedisStoredCountry>
    }
  | undefined

export const initGeolocationStore = async (): Promise<void> => {
  const [countries, sortedIps] = await Promise.all([
    redis.get(KEYS.geolocationCountries),
    redis.get(KEYS.geolocationSortedIps),
  ])

  if (!countries) {
    logger.warn('Could not load geolocation countries redis store')
  }

  if (!sortedIps) {
    logger.warn('Could not load geolocation ip adresses redis store')
  }

  store = {
    ...(countries ? { countries: JSON.parse(countries) } : {}),
    ...(sortedIps ? { sortedIps: JSON.parse(sortedIps) } : {}),
  }
}

export const convertIpToNumber = (ip: string) => {
  return ip.split('.').reduce((acc, octet) => acc * 256 + parseInt(octet), 0)
}

const findIpCountryCode = (ip: string) => {
  const ipNumber = convertIpToNumber(ip)

  const sortedArray = store?.sortedIps || []

  if (!sortedArray.length) {
    return
  }

  let left = 0
  let right = sortedArray.length - 1

  while (left <= right) {
    const mid = Math.floor((left + right) / 2)
    if (sortedArray[mid].ipStartNum <= ipNumber) {
      left = mid + 1
    } else {
      right = mid - 1
    }
  }

  return sortedArray[right].countryCode
}

export const findCountry = (ip: string) => {
  const countryCode = findIpCountryCode(ip)

  if (countryCode) {
    return store?.countries?.[countryCode]
  }
}
