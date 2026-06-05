import {
  getGeolocation,
  supportedRegions,
  type UserRegion,
} from '../../model/models'
import { getRegionFromSearchParams } from './getRegionFromParams'

export async function resolveRegion(
  currentRegion: UserRegion | undefined,
  currentInitialRegion: UserRegion | undefined,
  searchParams: URLSearchParams
): Promise<{ region: UserRegion; initialRegion: UserRegion | undefined }> {
  let region: UserRegion | undefined = currentRegion
  let initialRegion: UserRegion | undefined = currentInitialRegion

  if (!region || !(region in supportedRegions)) {
    region = await getGeolocation()
    initialRegion = region
  }

  const forcedRegion = getRegionFromSearchParams(searchParams)
  if (forcedRegion) {
    region = forcedRegion
  }

  return { region, initialRegion }
}
