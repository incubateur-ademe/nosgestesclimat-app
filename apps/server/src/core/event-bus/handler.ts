import type { EventBusEvent } from './event.js'

/**
 * Base representation of an event handler
 */
export type Handler<
  Event extends EventBusEvent = EventBusEvent,
  Result = unknown,
> = (event: Event) => Result | Promise<Result>
