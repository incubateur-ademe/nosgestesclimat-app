import type { EventBusEvent } from './event.ts'
import type { Handler } from './handler.ts'

export type EventBusErrorReason<FinishedEvent extends EventBusEvent> = {
  event: FinishedEvent
  errors: Array<{
    handler: Handler<FinishedEvent>
    error: Error
  }>
}

export class EventBusError<FinishedEvent extends EventBusEvent> extends Error {
  public reasons: EventBusErrorReason<FinishedEvent>[]

  constructor(reasons: EventBusErrorReason<FinishedEvent>[]) {
    super()
    this.reasons = reasons
  }
}
