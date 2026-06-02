import { supportedRegions, type UserRegion } from '../../model/models'

export function getRegionFromSearchParams(
  searchParams: URLSearchParams
): UserRegion | null {
  if (!searchParams.has('region')) return null
  const region = searchParams.get('region')
  if (region && region in supportedRegions) {
    return region as UserRegion
  }
  return null
}
