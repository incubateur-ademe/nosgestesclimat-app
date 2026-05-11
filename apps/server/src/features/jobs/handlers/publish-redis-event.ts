import { redis } from '../../../adapters/redis/client.ts'
import { CHANNELS } from '../../../adapters/redis/constant.ts'
import type { Handler } from '../../../core/event-bus/handler.ts'
import type { JobCreatedEvent } from '../events/JobCreated.event.ts'
import { JobCreatedAsyncEvent } from '../events/JobCreated.event.ts'

export const publishRedisEvent: Handler<JobCreatedEvent> = ({ attributes }) => {
  return redis.publish(
    CHANNELS.apiEvents,
    JSON.stringify(new JobCreatedAsyncEvent(attributes))
  )
}
