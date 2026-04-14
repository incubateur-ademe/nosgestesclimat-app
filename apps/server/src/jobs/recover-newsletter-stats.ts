import dayjs from 'dayjs'
import { recoverNewsletterSubscriptions } from '../features/stats/stats.service.js'

const main = async () => {
  await recoverNewsletterSubscriptions(dayjs().format('YYYY-MM-DD'))
}

main()
