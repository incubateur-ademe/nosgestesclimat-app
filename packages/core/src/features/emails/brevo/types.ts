export type BrevoConfig = Readonly<{
  url: string
  apiKey: string
}>

export type RequestOptions = Readonly<{
  timeout?: number
  retries?: number
}>
