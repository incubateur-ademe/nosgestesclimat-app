import { redisClientFactory } from './adapters/redis/client.ts'
import { CHANNELS } from './adapters/redis/constant.ts'
import { EventBus } from './core/event-bus/event-bus.ts'
import { JobCreatedAsyncEvent } from './features/jobs/events/JobCreated.event.ts'
import { dispatchJob } from './features/jobs/handlers/dispatch-job.ts'
import { SimulationUpsertedAsyncEvent } from './features/simulations/events/SimulationUpserted.event.ts'
import { computePollStats } from './features/simulations/handlers/compute-poll-stats.ts'
import logger from './logger.ts'

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
