/*
	Calls the DeepL API to translate the UI content.

	Command: npm run translate:ui -- [options]
*/

import cli from '@incubateur-ademe/nosgestesclimat-scripts/cli'
import deepl from '@incubateur-ademe/nosgestesclimat-scripts/deepl'
import utils from '@incubateur-ademe/nosgestesclimat-scripts/utils'
import c from 'ansi-colors'
import cliProgress from 'cli-progress'
import fs from 'fs'
import * as paths from './paths.js'

const { srcLang, destLangs, force, remove } = cli.getArgs(
  'Calls the DeepL API to translate the UI from the French one.',
  { source: true, force: true, target: true, remove: true }
)

const srcPath = paths.UI[srcLang].withLock

if (!fs.existsSync(srcPath)) {
  cli.printErr(
    `ERROR: ${srcPath} does not exist.\nPlease run: 'pnpm generate:ui' first.`
  )
  process.exit(-1)
}

const progressBars = new cliProgress.MultiBar(
  {
    stopOnComplete: true,
    clearOnComplete: true,
    forceRedraw: true,
    format: '{lang} | {value}/{total} | {bar} | {msg} ',
  },
  cliProgress.Presets.shades_grey
)

const consecutiveEmojiRegexp =
  /(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])/g

const interpolatedValueRegexp = /\{\{(.*)\}\}/g

const ignoredValueRegexp = /<ignore>(.*)<\/ignore>/g

const translateTo = async (targetLang, targetPath) => {
  const missingTranslations = utils.getUiMissingTranslations(
    srcPath,
    targetPath,
    force
  )

  console.log(
    `Found ${c.green(
      missingTranslations.length
    )} missing translations for the language ${c.yellow(targetLang)}.`
  )

  let translatedEntries = utils.readYAML(targetPath).entries
  if (missingTranslations.length > 0) {
    let bar = progressBars.create(missingTranslations.length, 0)

    await Promise.all(
      missingTranslations
        .map(([key, value]) => [key, value === 'NO_TRANSLATION' ? key : value])
        .map(async ([key, refValue]) => {
          try {
            const valueWithIgnoreTags = refValue.replace(
              interpolatedValueRegexp,
              '<ignore>$1</ignore>'
            )
            const translation = await deepl.fetchTranslation(
              valueWithIgnoreTags,
              srcLang,
              targetLang
            )
            const translationWithCombinedEmojis = translation
              .replace(consecutiveEmojiRegexp, (_, p1, p2) => `${p1}‍${p2}`)
              .replace(ignoredValueRegexp, '{{$1}}')

            translatedEntries[key] = translationWithCombinedEmojis
            if (utils.isI18nKey(key)) {
              // we need to store the lock value.
              translatedEntries[key + utils.LOCK_KEY_EXT] = refValue
            }
            bar.increment({
              msg: `Translating '${key}'...`,
              lang: targetLang,
            })
          } catch (err) {
            cli.printErr(
              `ERROR: an error occured while fetching the '${key}' translations:`
            )
            cli.printErr(err)
          }
        })
    )
  }
  if (remove) {
    // removes unused keys in translations
    const srcEntriesKeys = Object.keys(utils.readYAML(srcPath).entries)
    const srcEntriesKeysWithLock = srcEntriesKeys.flatMap((key) => [
      key,
      key + utils.LOCK_KEY_EXT,
    ])

    const entriesToKeep = Object.entries(translatedEntries).filter(([key]) => {
      return (
        srcEntriesKeys.includes(key) || srcEntriesKeysWithLock.includes(key)
      )
    })

    const nbEntriesToRemove =
      Object.keys(translatedEntries).length - entriesToKeep.length

    if (nbEntriesToRemove > 0) {
      console.log(
        `Removed ${c.yellow(nbEntriesToRemove)} translations for ${c.yellow(
          targetLang
        )}`
      )
      translatedEntries = Object.fromEntries(entriesToKeep)
    }
  }
  utils.writeYAML(targetPath, { entries: translatedEntries })
}
destLangs.forEach((lang) => {
  translateTo(lang, paths.UI[lang].withLock)
})
