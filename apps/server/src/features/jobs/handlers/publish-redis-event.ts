import { redis } from '../../../adapters/redis/client.js'
import { CHANNELS } from '../../../adapters/redis/constant.js'
import type { Handler } from '../../../core/event-bus/handler.js'
import type { JobCreatedEvent } from '../events/JobCreated.event.js'
import { JobCreatedAsyncEvent } from '../events/JobCreated.event.js'

export const publishRedisEvent: Handler<JobCreatedEvent> = ({ attributes }) => {
  return redis.publish(
    CHANNELS.apiEvents,
    JSON.stringify(new JobCreatedAsyncEvent(attributes))
  )
}
