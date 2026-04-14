import { randomUUID } from 'crypto'
import {
  isPromiseFullfilled,
  isPromiseRejected,
} from '../typeguards/isPromiseAllSettled.js'
import type { EventBusErrorReason } from './error.js'
import { EventBusError } from './error.js'
import type { EventBusEvent, EventBusEventConstructor } from './event.js'
import type { Handler } from './handler.js'

type EventSubscriptions<SubscribedEvent extends EventBusEvent = EventBusEvent> =
  {
    [key: string]: Handler<SubscribedEvent>
  }

/**
 * Holds events subscriptions
 * Allows to bind events emitted with handlers
 */
const eventSubscriptionsMap: Map<
  EventBusEventConstructor,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  EventSubscriptions<any>
> = new Map()

type EventPromiseResult<SubscribedEvent extends EventBusEvent> = {
  handler: Handler<SubscribedEvent>
  result: ReturnType<Handler<SubscribedEvent>>
}

type EventBusResult<FinishedEvent extends EventBusEvent> = {
  event: FinishedEvent
  results: EventPromiseResult<FinishedEvent>[]
}

/**
 * Holds events result promises
 * Allows the events to be awaited
 */
const eventsMap: Map<
  EventBusEvent,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Promise<PromiseSettledResult<EventPromiseResult<any>>[]>
> = new Map()

/**
 * Get the subscriptions for a given event constructor.
 *
 * @param eventConstructor constructor of the event
 *
 * @returns subscriptions for the event
 */
const getEventSubscriptions = <SubscribedEvent extends EventBusEvent>(
  eventConstructor: EventBusEventConstructor
): EventSubscriptions<SubscribedEvent> => {
  let subscriptions = eventSubscriptionsMap.get(eventConstructor) as
    | EventSubscriptions<SubscribedEvent>
    | undefined
  // Create root key to store subscriptions if not present
  if (!subscriptions) {
    subscriptions = {}
    eventSubscriptionsMap.set(eventConstructor, subscriptions)
  }

  return subscriptions
}

/**
 * EventBus implementation
 *
 * Example usage:
 *
 * // Define event attributes
 * type MyEventAttributes = {
 *   foo: string
 * }
 *
 * class MyEvent extends EventBusEvent<MyEventAttributes> {}
 *
 * const myHandler: Handler<MyEvent> = (event) => {
 *   // Your implementation here
 * }
 *
 * EventBus.on(MyEvent, myHandler) // Subscribe in controller
 *
 * // Emit and await in services
 * const myEvent = new MyEvent({ foo: 'bar' })
 * EventBus.emit(myEvent)
 * await EventBus.once(myEvent) // Promise resolved when event is flushed
 */
export const EventBus = {
  /**
   * Registers an event with the provided callback.
   * Registration should be done in the controllers layer only.
   *
   * @param {EventBusEventConstructor} eventConstructor constructor of the event. Must extends Event class
   * @param {Handler} handler handler class that reacts to the event type
   *
   * @returns unsubscribe callback
   */
  on<SubscribedEvent extends EventBusEvent>(
    eventConstructor: EventBusEventConstructor,
    handler: Handler<SubscribedEvent>
  ): () => void {
    // Get the event subscriptions
    const subscriptions = getEventSubscriptions(eventConstructor)

    // Generate id for each subscriptions
    const id = randomUUID()

    // Register callback
    subscriptions[id] = handler as Handler<EventBusEvent>

    // Return unsubscribe function in order to clear the cache
    return () => delete subscriptions[id]
  },

  /**
   * Runs subscribed handler based on given event.
   * Event should be emitted from the services layer only.
   *
   * @param {EventBusEvent} event
   *
   * @returns self
   */
  emit<EmittedEvent extends EventBusEvent>(event: EmittedEvent) {
    const subscriptions = eventSubscriptionsMap.get(
      event.constructor as EventBusEventConstructor
    )

    if (!subscriptions) return this

    // Store the subscriptions results in a Promise that cannot fail
    eventsMap.set(
      event,
      Promise.allSettled(
        Object.keys(subscriptions).map(
          (id) =>
            new Promise<EventPromiseResult<EmittedEvent>>((res, rej) => {
              const handler = subscriptions[id] as Handler<EmittedEvent>
              process.nextTick(async () => {
                try {
                  const result = await handler(event)
                  return res({
                    handler,
                    result,
                  })
                } catch (error) {
                  return rej({
                    handler,
                    error,
                  })
                }
              })
            })
        )
        // Clear the cache
      ).then((results) => {
        eventsMap.delete(event)
        return results
      })
    )

    return this
  },

  /**
   * Returns a Promise that will be fulfilled when all
   * the subscriptions for the given events will be fullfilled
   *
   * @param {EventBusEvent[]} events
   *
   * @returns {Promise<EventBusResult<EventBusEvent>[]>} the event results, mapped by event / handlers
   */
  async once<FinishedEvent extends EventBusEvent>(
    ...events: FinishedEvent[]
  ): Promise<EventBusResult<FinishedEvent>[]> {
    // Get all the event promises that cannot raise and fallback if we cannot get the event
    const eventPromises = events.map((event) =>
      (eventsMap.get(event) || Promise.resolve([])).then(
        (subscriptionResults) => ({
          event,
          subscriptionResults,
        })
      )
    )

    // await all the events promises that cannot raise
    const eventsResults = await Promise.all(eventPromises)

    // Look for errors
    const eventBusErrorReasons = eventsResults.reduce(
      (
        acc: EventBusErrorReason<EventBusEvent>[],
        { event, subscriptionResults }
      ) => {
        const errors = subscriptionResults
          .filter(isPromiseRejected)
          .map((r) => r.reason)

        if (errors.length) {
          acc.push({
            errors,
            event,
          })
        }

        return acc
      },
      []
    )

    // Raise if error
    if (eventBusErrorReasons.length) {
      throw new EventBusError(eventBusErrorReasons)
    }

    // return all the results by event / handlers
    return eventsResults.map(({ event, subscriptionResults }) => ({
      event,
      results: subscriptionResults
        .filter(isPromiseFullfilled)
        .map(({ value }) => value),
    })) as EventBusResult<FinishedEvent>[]
  },

  /**
   * Returns a Promise that resolves when all the events are finished
   * Use with care ! EventBus is static for all the requests
   *
   * @returns Promise<void>
   */
  async flush() {
    return new Promise<void>((res) => {
      const check = () => {
        const nextEvent = eventsMap.values().next()
        if (!nextEvent.value) {
          return res()
        }

        nextEvent.value.then(check)
      }

      check()
    })
  },
}
