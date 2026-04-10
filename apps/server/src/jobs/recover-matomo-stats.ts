import dayjs from 'dayjs'
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import { recoverDayStats } from '../features/stats/stats.service.js'
import logger from '../logger.js'

const YYYY_MM_DD_REGEX = /^(\d{4})-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/

const args = yargs(hideBin(process.argv))
  .option('from', {
    alias: 'f',
    type: 'string',
    description: 'The day to import format YYYY-MM-DD',
    default: dayjs().subtract(1, 'day').format('YYYY-MM-DD'),
  })
  .option('to', {
    alias: 't',
    type: 'string',
    description: 'The day to import format YYYY-MM-DD',
    default: dayjs().subtract(1, 'day').format('YYYY-MM-DD'),
  })
  .parse()

const main = async () => {
  const { from, to } = await args

  if (!YYYY_MM_DD_REGEX.test(from) || !YYYY_MM_DD_REGEX.test(to)) {
    logger.warn('Invalid period', { from, to })
    return
  }

  let date = from
  while (date <= to) {
    console.log(`Importing stats for ${date}`)
    console.time(`Importing stats for ${date}`)
    await recoverDayStats(date)
    console.timeEnd(`Importing stats for ${date}`)
    date = dayjs(date).add(1, 'day').format('YYYY-MM-DD')
  }
}

main()
