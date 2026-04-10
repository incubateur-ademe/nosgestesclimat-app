import { redis } from '../adapters/redis/client.js'
import { CHANNELS } from '../adapters/redis/constant.js'
import type { EventBusEvent } from './event-bus/event.js'

export const publishApiEvent = (event: EventBusEvent) => {
  return redis.publish(CHANNELS.apiEvents, JSON.stringify(event))
}
