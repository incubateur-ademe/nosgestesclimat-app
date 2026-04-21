import type { Locale } from '@/i18nConfig'
import packageJson from '@incubateur-ademe/nosgestesclimat/package.json'
import type { Simulation } from '../server/model/simulations'
import { defaultProps } from './getRules'

/**
 * Returns the version of the model in the format REGION-locale-VERSION
 * Example: FR-fr-3.7.0
 */
export function getModelVersion({
  mode = 'standard',
  regionCode = defaultProps.regionCode,
  locale = defaultProps.locale as Locale,
}: {
  mode?: 'scolaire' | 'standard'
  regionCode?: string
  locale?: Locale
} = {}): Simulation['model'] {
  const version = packageJson.version
  return `${mode === 'scolaire' ? 'ED' : regionCode}-${locale}-${version}` as Simulation['model']
}
