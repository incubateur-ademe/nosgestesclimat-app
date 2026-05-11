import { redis } from '../../../adapters/redis/client.ts'
import { CHANNELS } from '../../../adapters/redis/constant.ts'
import type { Handler } from '../../../core/event-bus/handler.ts'
import type { SimulationUpsertedEvent } from '../events/SimulationUpserted.event.ts'
import { SimulationUpsertedAsyncEvent } from '../events/SimulationUpserted.event.ts'

export const publishRedisEvent: Handler<SimulationUpsertedEvent> = ({
  attributes,
}) => {
  return redis.publish(
    CHANNELS.apiEvents,
    JSON.stringify(new SimulationUpsertedAsyncEvent(attributes))
  )
}
