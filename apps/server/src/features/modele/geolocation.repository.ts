import { continents, countries } from 'countries-list'
import { redis } from '../../adapters/redis/client.ts'
import { KEYS } from '../../adapters/redis/constant.ts'
import logger from '../../logger.ts'

type RedisStoredIp = { ipStartNum: number; countryCode: string }

let store:
  | {
      sortedIps?: RedisStoredIp[]
    }
  | undefined

export const initGeolocationStore = async (): Promise<void> => {
  const sortedIps = await redis.get(KEYS.geolocationSortedIps)

  if (!sortedIps) {
    logger.warn('Could not load geolocation ip adresses redis store')
  }

  store = {
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

  if (!countryCode || !(countryCode in countries)) {
    return
  }

  const countryData = countries[countryCode as keyof typeof countries]

  return {
    code: countryCode,
    region: continents[countryData.continent],
  }
}
