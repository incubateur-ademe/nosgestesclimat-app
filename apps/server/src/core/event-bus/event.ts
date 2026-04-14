/**
 * Base representation of an event Attributes
 * Basically a record of anything
 */
export type EventBusEventAttributes = Record<string | number, unknown>

/**
 * Base representation of an event Constructor
 */
export type EventBusEventConstructor<
  Attributes extends EventBusEventAttributes = EventBusEventAttributes,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
> = new (...args: any[]) => EventBusEvent<Attributes>

/**
 * Base event
 *
 * Example usage:
 *
 * // Define event attributes
 * type MyEventAttributes = {
 *   foo: string
 * }
 *
 * // Basic usage
 * class MyEvent extends EventBusEvent<MyEventAttributes> {}
 *
 * // Create an event
 * const myEvent = new MyEvent({ foo: 'bar' })
 */
export abstract class EventBusEvent<
  Attributes extends EventBusEventAttributes = EventBusEventAttributes,
> {
  constructor(public readonly attributes: Readonly<Attributes>) {}
}
