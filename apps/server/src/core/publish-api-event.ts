import { redis } from '../adapters/redis/client.ts'
import { CHANNELS } from '../adapters/redis/constant.ts'
import type { EventBusEvent } from './event-bus/event.ts'

export const publishApiEvent = (event: EventBusEvent) => {
  return redis.publish(CHANNELS.apiEvents, JSON.stringify(event))
}
