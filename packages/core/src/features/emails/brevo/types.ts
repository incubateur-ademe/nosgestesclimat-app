export type BrevoConfig = Readonly<{
  url: string
  apiKey: string
}>

export type RequestOptions = Readonly<{
  timeout?: number
  retries?: number
  /** Answers that mean the request is already in the state it asks for. */
  tolerateStatuses?: readonly number[]
}>
