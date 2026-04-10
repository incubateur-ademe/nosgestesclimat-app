import { redisClientFactory } from './adapters/redis/client.js'
import { CHANNELS } from './adapters/redis/constant.js'
import { EventBus } from './core/event-bus/event-bus.js'
import { JobCreatedAsyncEvent } from './features/jobs/events/JobCreated.event.js'
import { dispatchJob } from './features/jobs/handlers/dispatch-job.js'
import { SimulationUpsertedAsyncEvent } from './features/simulations/events/SimulationUpserted.event.js'
import { computePollStats } from './features/simulations/handlers/compute-poll-stats.js'
import logger from './logger.js'

const RedisApiEventMap = {
  SimulationUpsertedAsyncEvent,
  JobCreatedAsyncEvent,
} as const

EventBus.on(SimulationUpsertedAsyncEvent, computePollStats)
EventBus.on(JobCreatedAsyncEvent, dispatchJob)

const parseMessage = (message: string) => {
  const { name, attributes } = JSON.parse(message)

  return new RedisApiEventMap[name as keyof typeof RedisApiEventMap](attributes)
}

const subscriber = redisClientFactory()

subscriber.subscribe(CHANNELS.apiEvents, () => {
  console.log(`Worker listening  ${CHANNELS.apiEvents}`)
})

subscriber.on('message', async (_, message) => {
  try {
    const event = parseMessage(message)

    EventBus.emit(event)

    await EventBus.once(event)
    logger.info('Handled event', { event })
  } catch (err) {
    logger.error('Redis api event failure', err)
  }
})
