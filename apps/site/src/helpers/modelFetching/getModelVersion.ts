import packageJson from '@incubateur-ademe/nosgestesclimat/package.json'
import { defaultProps } from './getRules'

/**
 * Returns the version of the model in the format REGION-locale-VERSION
 * Example: FR-fr-3.7.0
 */
export function getModelVersion(): string {
  const version = packageJson.version
  return `${defaultProps.regionCode}-${defaultProps.locale}-${version}`
}
