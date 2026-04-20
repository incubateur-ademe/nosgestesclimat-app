import packageJson from '@incubateur-ademe/nosgestesclimat/package.json'
import type { Simulation } from '../server/model/simulations'
import { defaultProps } from './getRules'

/**
 * Returns the version of the model in the format REGION-locale-VERSION
 * Example: FR-fr-3.7.0
 */
export function getModelVersion(): Simulation['model'] {
  const version = packageJson.version
  return `${defaultProps.regionCode}-${defaultProps.locale}-${version}` as Simulation['model']
}
