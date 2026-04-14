import { redis } from '../../../adapters/redis/client.js'
import { CHANNELS } from '../../../adapters/redis/constant.js'
import type { Handler } from '../../../core/event-bus/handler.js'
import type { SimulationUpsertedEvent } from '../events/SimulationUpserted.event.js'
import { SimulationUpsertedAsyncEvent } from '../events/SimulationUpserted.event.js'

export const publishRedisEvent: Handler<SimulationUpsertedEvent> = ({
  attributes,
}) => {
  return redis.publish(
    CHANNELS.apiEvents,
    JSON.stringify(new SimulationUpsertedAsyncEvent(attributes))
  )
}
