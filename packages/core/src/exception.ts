export type ExceptionPayload = Record<string, unknown>

export abstract class Exception<
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  Payload extends Record<string, unknown> = {},
> extends Error {
  public readonly level: 'warning' | 'error' | 'info' | 'fatal' = 'error'
  public readonly payload: Payload

  constructor(
    params: {
      message?: string
      cause?: unknown
    } & Payload
  ) {
    const { message, cause, ...payload } = params
    super(message, { cause })
    this.name = this.constructor.name
    this.payload = payload as unknown as Payload
  }
}
