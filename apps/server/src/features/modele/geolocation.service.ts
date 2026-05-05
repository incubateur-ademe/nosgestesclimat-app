import { isIPv4 } from 'node:net'
import { EntityNotFoundException } from '../../core/errors/EntityNotFoundException.ts'
import { findCountry } from './geolocation.repository.ts'

export const getModeleCountry = (ip?: string) => {
  if (!ip || !isIPv4(ip)) {
    throw new EntityNotFoundException('ip v4 required')
  }

  const country = findCountry(ip)

  if (!country) {
    throw new EntityNotFoundException('could not determine ip country')
  }

  return country
}
