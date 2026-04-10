/*
	Calls the DeepL API to translate the Markdown files.

	Command: pnpm translate:md [options]
*/

const fs = require('fs')
const { glob } = require('glob')

const deepl = require('@incubateur-ademe/nosgestesclimat-scripts/deepl')
const cli = require('@incubateur-ademe/nosgestesclimat-scripts/cli')
const c = require('ansi-colors')

const { srcLang, destLangs, srcFile, force } = cli.getArgs(
  'Calls the DeepL API to translate the Markdown files.',
  {
    file: true,
    source: true,
    force: true,
    target: true,
  }
)

const fileGlob = srcFile ?? '*.{md,mdx}'

const translateTo = async (src, destPath, destLang) => {
  console.log(`Translating to ${c.yellow(destPath)}...`)
  const translation = await deepl.fetchTranslationMarkdown(
    src,
    srcLang.toUpperCase(),
    destLang.toUpperCase()
  )
  fs.writeFileSync(destPath, translation, 'utf8', { flag: 'w' })
}

console.log(
  `Translating Markdown files from ${c.yellow(
    `src/locales/pages/${srcLang}/${fileGlob}`
  )}...`
)

glob(`src/locales/pages/${srcLang}/${fileGlob}`)
  .then((files) => {
    console.log(`Found ${c.green(files.length)} files to translate.`)

    console.log('files', files)
    files.forEach((file) => {
      const src = fs.readFileSync(file, 'utf8')
      destLangs.forEach((destLang) => {
        const destPath = file.replace(srcLang, destLang)
        if (!fs.existsSync(destPath) || force) {
          translateTo(src, destPath, destLang)
        } else {
          console.log(
            `The file ${c.yellow(destPath)} already exists, ${c.yellow(
              'skipping'
            )}... (use the -f to force the translation)`
          )
        }
      })
    })
  })
  .catch((err) => {
    cli.exitIfError(err, 'ERROR: an error occured while fetching the files:')
  })
