/*
	Simple module containing all paths implicated to the translation.
*/

import utils from '@incubateur-ademe/nosgestesclimat-scripts/utils'
import path from 'path'

const localesDir = path.resolve('./src/locales')
const rulesTranslation = path.resolve('./src/locales/rules-en.yaml')
const staticAnalysisFrRes = path.resolve(
  './src/locales/static-analysis-fr.json'
)
const UI = Object.fromEntries(
  utils.availableLanguages.map((lang) => [
    lang,
    {
      withLock: path.resolve(`./src/locales/ui/ui-${lang}.yaml`),
      withoutLock: path.resolve(`./src/locales/ui/ui-${lang}-min.yaml`),
    },
  ])
)

const FAQ = Object.fromEntries(
  utils.availableLanguages.map((lang) => [
    lang,
    {
      withLock: path.resolve(`./src/locales/faq/FAQ-${lang}.yaml`),
      withoutLock: path.resolve(`./src/locales/faq/FAQ-${lang}-min.yaml`),
    },
  ])
)

export { FAQ, UI, localesDir, rulesTranslation, staticAnalysisFrRes }
