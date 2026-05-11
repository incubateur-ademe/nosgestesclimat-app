import { EventBusEvent } from '../../../core/event-bus/event.ts'

export class JobCreatedEvent extends EventBusEvent<{
  jobId: string
}> {
  name = 'JobCreatedEvent'
}

export class JobCreatedAsyncEvent extends EventBusEvent<{
  jobId: string
}> {
  name = 'JobCreatedAsyncEvent'
}
